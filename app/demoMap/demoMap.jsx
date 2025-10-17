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
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("A"); // A = Static, B = Live, C = Driving
  const webviewRef = useRef(null);
  const watcher = useRef(null);

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
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Fetch multiple route suggestions
  const fetchRoutes = async (newOrigin) => {
    if (!newOrigin || !destination) return;
    setLoading(true);
    try {
      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEwMmFjMTI1NWNiMTRkMmJiZGMwZjdmZjFhYjUyNDdiIiwiaCI6Im11cm11cjY0In0=",
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

      if (!data?.features?.length) {
        Alert.alert("No routes found", "Try another location.");
        return;
      }

      const routeOptions = data.features.map((f, idx) => ({
        id: idx + 1,
        coords: f.geometry.coordinates.map((c) => [c[1], c[0]]),
        distance: (f.properties.summary.distance / 1000).toFixed(2),
        duration: (f.properties.summary.duration / 60).toFixed(1),
      }));

      const fastest = routeOptions.reduce((a, b) =>
        parseFloat(a.duration) < parseFloat(b.duration) ? a : b
      );

      setRoutes(routeOptions);
      setSelectedRoute(fastest);

      Alert.alert(
        "Fastest Route Suggested",
        `🔥 ${fastest.distance} km — ⏱ ${fastest.duration} mins`,
        routeOptions.map((r) => ({
          text: `Route ${r.id} (${r.distance} km / ${r.duration} min)`,
          onPress: () => setSelectedRoute(r),
        }))
      );
    } catch (err) {
      console.error("ORS fetch error:", err);
      Alert.alert("Error", "Unable to fetch routes from ORS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (origin && destination) fetchRoutes(origin);
  }, [origin, destination]);

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

        // Send live position to WebView
        if (webviewRef.current) {
          webviewRef.current.injectJavaScript(`
            if (window.updateMarker) window.updateMarker(${newPos.latitude}, ${newPos.longitude});
          `);
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

  if (loading || !origin) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#b30d0d" />
      </View>
    );
  }

  // ✅ Map HTML
  const html = `
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
        var zoomLevel = 17;
        var drivingMode = false;

        var map = L.map('map', { zoomControl: false }).setView([${
          origin.latitude
        }, ${origin.longitude}], zoomLevel);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

        var originMarker = L.marker([${origin.latitude}, ${
    origin.longitude
  }]).addTo(map).bindPopup("🚒 Current Location");

        ${
          selectedRoute
            ? `
          var latlngs = ${JSON.stringify(selectedRoute.coords)};
          var polyline = L.polyline(latlngs, { color: 'blue', weight: 5 }).addTo(map);

          var endPoint = latlngs[latlngs.length - 1];
          const iconHtml = '${type}' === "fire" ? "🔥" : "💧";
          const label = '${type}' === "fire" ? "🔥 Fire Location" : "💧 Hydrant Location";
          const customIcon = L.divIcon({
            html: '<div style="font-size: 30px; transform: translate(-50%, -50%);">' + iconHtml + '</div>',
            className: "",
            iconSize: [30, 30],
          });
          L.marker(endPoint, { icon: customIcon }).addTo(map).bindPopup(label);
        `
            : ""
        }

        // ✅ Update Marker
        window.updateMarker = function(lat, lng) {
          originMarker.setLatLng([lat, lng]);
          if (drivingMode) {
            map.panTo([lat, lng], { animate: true, duration: 0.5 });
          } else {
            map.setView([lat, lng], zoomLevel);
          }
        };

        // ✅ Toggle driving mode from React
        window.toggleDrivingMode = function(enabled) {
          drivingMode = enabled;
          if (enabled) {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
          } else {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
          }
        };
      </script>
    </body>
    </html>
  `;

  // ✅ Button Handlers
  const toggleDrivingMode = () => {
    const newMode = mode === "C" ? "B" : "C";
    setMode(newMode);
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(
        `window.toggleDrivingMode(${newMode === "C"});`
      );
    }
  };

  return (
    <View style={styles.container}>
      <WebView ref={webviewRef} source={{ html }} />
      {selectedRoute && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>🚗 {selectedRoute.distance} km</Text>
          <Text style={styles.routeText}>⏱ {selectedRoute.duration} mins</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.modeButton}
        onPress={() => setMode(mode === "A" ? "B" : "A")}
      >
        <Text style={styles.modeText}>
          {mode === "A" ? "🟢 Live Navigation (B)" : "🔵 Static Zoom (A)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.driveButton} onPress={toggleDrivingMode}>
        <Text style={styles.modeText}>
          {mode === "C" ? "❌ Exit Driving Mode" : "🚘 Driving Mode"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.rerouteButton}
        onPress={() => fetchRoutes(origin)}
      >
        <Text style={styles.rerouteText}>🔄 Suggest Routes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  rerouteButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#b30d0d",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 5,
  },
  rerouteText: { color: "white", fontWeight: "bold", fontSize: 16 },
  routeInfo: {
    position: "absolute",
    bottom: 90,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 10,
  },
  routeText: { color: "white", fontSize: 14 },
  modeButton: {
    position: "absolute",
    top: 650,
    right: 20,
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 5,
  },
  driveButton: {
    position: "absolute",
    top: 605,
    right: 20,
    backgroundColor: "#1a73e8",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 5,
  },
  modeText: { color: "white", fontWeight: "bold" },
});
