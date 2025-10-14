import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function OSMWithORS({ destination }) {
  const [origin, setOrigin] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get initial current location
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
      }
    })();
  }, []);

  // ✅ Function to fetch route (ORS API)
  const fetchRoute = async (newOrigin, preference = "recommended") => {
    if (!newOrigin || !destination) return;

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
            preference,
          }),
        }
      );

      const data = await response.json();
      if (data?.features?.length) {
        const coords = data.features[0].geometry.coordinates;
        setRouteCoords(coords);
      }
    } catch (err) {
      console.error("ORS fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch route when origin is ready
  useEffect(() => {
    if (origin && destination) {
      fetchRoute(origin);
    }
  }, [origin, destination]);

  // ✅ 🛰️ Real-time tracking like Waze
  useEffect(() => {
    let watcher = null;

    const startWatching = async () => {
      try {
        watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // every 10 meters
          },
          (loc) => {
            const newOrigin = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            setOrigin(newOrigin);
            fetchRoute(newOrigin); // 🔄 Auto reroute
          }
        );
      } catch (error) {
        console.error("Error watching position:", error);
      }
    };

    startWatching();

    return () => {
      if (watcher) watcher.remove(); // stop watching when unmounted
    };
  }, [destination]);

  // ✅ Handle manual reroute
  const handleReroute = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newOrigin = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setOrigin(newOrigin);
      setRouteCoords(null);
      await fetchRoute(newOrigin, "shortest");
    } catch (error) {
      console.error("Reroute error:", error);
      Alert.alert("Error", "Unable to get current position.");
    }
  };

  // ✅ Handle fastest route button
  const handleFastestRoute = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newOrigin = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setOrigin(newOrigin);
      fetchRoute(newOrigin, "fastest");
    } catch (error) {
      console.error("Fastest route error:", error);
      Alert.alert("Error", "Unable to calculate fastest route.");
    }
  };

  if (loading || !origin) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#b30d0d" />
      </View>
    );
  }

  // ✅ HTML Map
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${origin.latitude}, ${
    origin.longitude
  }], 14);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

          var originMarker = L.marker([${origin.latitude}, ${origin.longitude}])
            .addTo(map)
            .bindPopup("🚒 Current Location")
            .openPopup();

          var destMarker = L.marker([${destination.latitude}, ${
    destination.longitude
  }])
            .addTo(map)
            .bindPopup("🔥 Fire Location");

          ${
            routeCoords
              ? `
            var latlngs = ${JSON.stringify(
              routeCoords.map((c) => [c[1], c[0]])
            )};
            var polyline = L.polyline(latlngs, {color: 'blue'}).addTo(map);
            map.fitBounds(polyline.getBounds());
          `
              : ""
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView source={{ html }} />

      {/* 🔄 Manual Reroute Button */}
      <TouchableOpacity style={styles.rerouteButton} onPress={handleReroute}>
        <Text style={styles.rerouteText}>🔄 Reroute</Text>
      </TouchableOpacity>

      {/* ⚡ Fastest Route Button */}
      <TouchableOpacity
        style={[styles.rerouteButton, styles.fastestButton]}
        onPress={handleFastestRoute}
      >
        <Text style={styles.rerouteText}>⚡ Fastest</Text>
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

  fastestButton: {
    backgroundColor: "#007AFF",
    right: 120,
    marginRight: 20,
  },

  rerouteText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
