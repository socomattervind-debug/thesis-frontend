import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function OSMWithORS({ destination, type }) {
  const [origin, setOrigin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mode, setMode] = useState("A"); // A=Static, B=Live, C=Driving

  const webviewRef = useRef(null);
  const watcher = useRef(null);
  const initialHtml = useRef("");

  // ✅ Get current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Location permission denied");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setOrigin({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Fetch multiple routes and show Alert for selection
  const fetchRoutes = async (newOrigin, isReroute = false) => {
    if (!newOrigin || !destination) return;
    try {
      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEwMmFjMTI1NWNiMTRkMmJiZGMwZjdmZjFhYjUyNDdiIiwiaCI6Im11cm11cjY0In0=", // Replace with your ORS API key
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates: [
              [newOrigin.longitude, newOrigin.latitude],
              [destination.longitude, destination.latitude],
            ],
            alternative_routes: {
              target_count: 3,
              share_factor: 0.6,
              weight_factor: 1.4,
            },
          }),
        }
      );
      const data = await response.json();
      if (!data?.features?.length) return;

      const routeOptions = data.features.map((f, idx) => ({
        id: idx + 1,
        coords: f.geometry.coordinates.map((c) => [c[1], c[0]]),
        distance: (f.properties.summary.distance / 1000).toFixed(2),
        duration: (f.properties.summary.duration / 60).toFixed(1),
      }));

      // ✅ Show Alert for route selection
      Alert.alert(
        isReroute ? "Reroute" : "Select Route",
        "Choose your preferred route",
        routeOptions.map((r) => ({
          text: `Route ${r.id} - ${r.distance} km / ${r.duration} min`,
          onPress: () => {
            setSelectedRoute(r.coords);
            setRouteInfo({ distance: r.distance, duration: r.duration });
            if (isReroute) {
              // 🔁 Update the existing polyline dynamically (no reload)
              if (webviewRef.current) {
                webviewRef.current.injectJavaScript(
                  `window.updateRoute(${JSON.stringify(r.coords)}); true;`
                );
              }
            } else {
              // First time setup
              buildMapHTML(r.coords, newOrigin);
            }
          },
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Build WebView HTML with selected route
  const buildMapHTML = (coords, originPos) => {
    initialHtml.current = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <style>#map { height: 100vh; width: 100%; }</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${
            originPos.latitude
          }, ${originPos.longitude}], 17);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

          var originMarker = L.marker([${originPos.latitude}, ${
      originPos.longitude
    }]).addTo(map).bindPopup("🚒 Current Location");

          var fullRoute = ${JSON.stringify(coords)};
          var polyline = L.polyline(fullRoute, { color: 'blue', weight: 5 }).addTo(map);

          var endPoint = fullRoute[fullRoute.length-1];
          const iconHtml = '${type}' === "fire" ? "🔥" : "💧";
          const label = '${type}' === "fire" ? "🔥 Fire Location" : "💧 Hydrant Location";
          const customIcon = L.divIcon({ html: '<div style="font-size: 30px; transform: translate(-50%, -50%);">'+iconHtml+'</div>', className: "", iconSize:[30,30] });
          L.marker(endPoint, { icon: customIcon }).addTo(map).bindPopup(label);

          var drivingMode = false;
          var zoomLevel = 17;

          window.updateMarker = function(lat,lng){
            originMarker.setLatLng([lat,lng]);
            var minDist = Infinity; var nearestIndex=0;
            fullRoute.forEach((pt,idx)=>{
              var d=Math.sqrt(Math.pow(lat-pt[0],2)+Math.pow(lng-pt[1],2));
              if(d<minDist){minDist=d; nearestIndex=idx;}
            });
            polyline.setLatLngs(fullRoute.slice(nearestIndex));
            if(drivingMode){ map.panTo([lat,lng],{animate:true,duration:0.5}); }
            else{ map.setView([lat,lng],zoomLevel);}
          };

          window.updateRoute = function(newCoords){
            fullRoute = newCoords;
            polyline.setLatLngs(fullRoute);
          };

          window.toggleDrivingMode = function(enabled){
            drivingMode=enabled;
            if(enabled){ map.dragging.disable(); map.scrollWheelZoom.disable(); } 
            else{ map.dragging.enable(); map.scrollWheelZoom.enable(); }
          };
        </script>
      </body>
      </html>
    `;
  };

  // ✅ Fetch routes only once after getting origin
  useEffect(() => {
    if (origin && !selectedRoute) fetchRoutes(origin);
  }, [origin]);

  // ✅ Live tracking
  const startLiveTracking = async () => {
    if (watcher.current) return;
    watcher.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (loc) => {
        const newPos = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setOrigin(newPos);
        if (webviewRef.current) {
          webviewRef.current.injectJavaScript(
            `window.updateMarker(${newPos.latitude}, ${newPos.longitude}); true;`
          );
        }
      }
    );
  };

  const stopLiveTracking = () => {
    if (watcher.current) {
      watcher.current.remove();
      watcher.current = null;
    }
  };

  useEffect(() => {
    if (mode === "B" || mode === "C") startLiveTracking();
    else stopLiveTracking();
    return () => stopLiveTracking();
  }, [mode]);

  if (loading || !origin || !initialHtml.current)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#b30d0d" />
      </View>
    );

  return (
    <View style={styles.container}>
      <WebView ref={webviewRef} source={{ html: initialHtml.current }} />

      {routeInfo && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>🚗 {routeInfo.distance} km</Text>
          <Text style={styles.routeText}>⏱ {routeInfo.duration} mins</Text>
        </View>
      )}

      {/* 🔄 Reroute Button */}
      <TouchableOpacity
        style={styles.rerouteButton}
        onPress={() => fetchRoutes(origin, true)}
      >
        <Text style={styles.modeText}>🔄 Reroute</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.modeButton}
        onPress={() => setMode(mode === "A" ? "B" : "A")}
      >
        <Text style={styles.modeText}>
          {mode === "A" ? "🟢 Live Navigation" : "🔵 Static Zoom"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.driveButton}
        onPress={() => {
          const newMode = mode === "C" ? "B" : "C";
          setMode(newMode);
          webviewRef.current.injectJavaScript(
            `window.toggleDrivingMode(${newMode === "C"}); true;`
          );
        }}
      >
        <Text style={styles.modeText}>
          {mode === "C" ? "❌ Exit Driving Mode" : "🚘 Driving Mode"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  routeInfo: {
    position: "absolute",
    bottom: 100,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 10,
  },
  routeText: { color: "white", fontSize: 14 },
  rerouteButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "#ff9500",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 5,
  },
  modeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 5,
  },
  driveButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#1a73e8",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 5,
  },
  modeText: { color: "white", fontWeight: "bold" },
});
