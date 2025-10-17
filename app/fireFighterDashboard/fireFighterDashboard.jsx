import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { io } from "socket.io-client";
import DemoMap from "../demoMap/demoMap";
import FireFighterIncidentReport from "../fireFighterIncidentReport/fireFighterIncidentReport";
import { getCoordinates } from "../service/api/fireFighterRoutes";

export default function FireFighterDashboard() {
  const [screen, setScreen] = useState("dashboard");
  const [coords, setCoords] = useState(null);
  const [hydrantCoords, setHydrantCoords] = useState(null);
  const [hydrants, setHydrants] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [loading, setLoading] = useState(false);

  const hydrantList = [
    { id: 1, name: "Hydrant 1", latitude: 14.6695, longitude: 120.9388 },
    { id: 2, name: "Hydrant 2", latitude: 14.6688, longitude: 120.9393 },
    { id: 3, name: "Hydrant 3", latitude: 14.6671, longitude: 120.9403 },
    { id: 4, name: "Hydrant 4", latitude: 14.6663, longitude: 120.9425 },
    { id: 5, name: "Hydrant 5", latitude: 14.6674, longitude: 120.9419 },
    { id: 6, name: "Hydrant 6", latitude: 14.6674, longitude: 120.9419 },
  ];

  // ✅ Get Firefighter’s current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location access is required.");
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
        console.error("Location error:", err);
      }
    })();
  }, []);

  // ✅ Fetch fire incident route
  useEffect(() => {
    if (screen === "extract") {
      setLoading(true);
      getCoordinates()
        .then((data) => {
          console.log("Fetched coords:", data);
          setCoords(data);
        })
        .catch((err) => console.error("Failed to fetch coords:", err))
        .finally(() => setLoading(false));
    }
  }, [screen]);

  // ✅ Real-time socket updates
  useEffect(() => {
    const socket = io("https://thesis-backend-zk2j.onrender.com");

    socket.on("coordinatesUpdated", (newCoord) => {
      const updated = {
        origin: {
          latitude: newCoord.origin.latitude,
          longitude: newCoord.origin.longitude,
        },
        destination: {
          latitude: newCoord.destination.latitude,
          longitude: newCoord.destination.longitude,
        },
      };
      setCoords(updated);
      console.log("🚨 New fire incident detected!");
    });

    return () => socket.disconnect();
  }, []);

  // ✅ Fetch hydrant distances from ORS
  const fetchHydrantRoutes = async () => {
    if (!origin) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        hydrantList.map(async (h) => {
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
                  [origin.longitude, origin.latitude],
                  [h.longitude, h.latitude],
                ],
              }),
            }
          );

          const data = await response.json();
          const summary = data?.features?.[0]?.properties?.summary;
          return {
            ...h,
            distance: summary ? (summary.distance / 1000).toFixed(2) : "N/A",
            duration: summary ? (summary.duration / 60).toFixed(1) : "N/A",
          };
        })
      );

      setHydrants(results);
    } catch (err) {
      console.error("Error fetching hydrant distances:", err);
      Alert.alert("Error", "Failed to fetch hydrant routes.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch hydrant distances when entering hydrant screen
  useEffect(() => {
    if (screen === "hydrant" && origin) {
      fetchHydrantRoutes();
    }
  }, [screen, origin]);

  // ✅ Screen Renderer
  const renderScreen = () => {
    switch (screen) {
      case "extract":
        return (
          <View style={{ flex: 1 }}>
            {coords && coords.destination ? (
              <DemoMap destination={coords.destination} type="fire" />
            ) : (
              <View style={styles.center}>
                <Text>Loading map data...</Text>
              </View>
            )}
            {loading && (
              <ActivityIndicator
                size="large"
                color="#b30d0d"
                style={{ ...StyleSheet.absoluteFillObject, zIndex: 10 }}
              />
            )}
            <BackButton onPress={() => setScreen("dashboard")} />
          </View>
        );

      case "hydrant":
        return (
          <View style={{ flex: 1, padding: 10 }}>
            {!hydrantCoords ? (
              <View style={styles.centered}>
                <Text style={styles.hydrantHeader}>
                  Choose a Fire Hydrant Location:
                </Text>

                {loading ? (
                  <ActivityIndicator size="large" color="#b30d0d" />
                ) : (
                  hydrants.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.hydrantOption}
                      onPress={() =>
                        setHydrantCoords({
                          destination: {
                            latitude: item.latitude,
                            longitude: item.longitude,
                            name: item.name,
                          },
                        })
                      }
                    >
                      <Text style={styles.hydrantText}>
                        💧 {item.name}{" "}
                        <Text style={{ color: "#555", fontSize: 14 }}>
                          (Distance: {item.distance} km • {item.duration} mins)
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  ))
                )}

                <BackButton onPress={() => setScreen("dashboard")} />
              </View>
            ) : (
              <>
                <DemoMap
                  destination={hydrantCoords.destination}
                  type="hydrant"
                />
                <TouchableOpacity
                  style={styles.backButtonOverlay}
                  onPress={() => setHydrantCoords(null)}
                >
                  <Text style={styles.backText}>⬅ Choose Another Hydrant</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );

      case "records":
        return (
          <View style={styles.screen}>
            <FireFighterIncidentReport />
            <BackButton onPress={() => setScreen("dashboard")} />
          </View>
        );

      default:
        return (
          <SafeAreaView style={styles.dashboard}>
            <Text style={styles.header}>🔥 Firefighter Dashboard</Text>
            <DashboardButton
              text="📍 Extract Address"
              onPress={() => setScreen("extract")}
            />
            <DashboardButton
              text="🚒 Fire Hydrant"
              onPress={() => setScreen("hydrant")}
            />
            <DashboardButton
              text="📝 Add Records"
              onPress={() => setScreen("records")}
            />
          </SafeAreaView>
        );
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}

// ✅ Reusable Components
const BackButton = ({ onPress }) => (
  <TouchableOpacity style={styles.backButtonOverlay} onPress={onPress}>
    <Text style={styles.backText}>⬅ Back</Text>
  </TouchableOpacity>
);

const DashboardButton = ({ text, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.cardText}>{text}</Text>
  </TouchableOpacity>
);

// ✅ Styles
const styles = StyleSheet.create({
  dashboard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f6f9",
  },
  header: {
    fontSize: 26,
    marginBottom: 40,
    fontWeight: "bold",
    color: "#b30d0d",
  },
  card: {
    width: "80%",
    backgroundColor: "#fff",
    paddingVertical: 20,
    marginBottom: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  backButtonOverlay: {
    position: "absolute",
    top: 50,
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#3a3434ff",
    borderRadius: 8,
    zIndex: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  centered: { alignItems: "center" },
  hydrantOption: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  hydrantText: { fontSize: 16, color: "#333", fontWeight: "600" },
  hydrantHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 110,
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
});
