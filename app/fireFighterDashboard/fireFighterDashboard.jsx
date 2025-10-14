import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { getHydrant } from "../service/api/fireFigtherRoutesForHydrant";

export default function FireFighterDashboard() {
  const [screen, setScreen] = useState("dashboard");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hydrantCoords, setHydrantCoords] = useState(null);

  // ✅ Fetch coordinates when "Extract Address" is opened
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

  // Fetch hydrant route when switching to "hydrant"
  useEffect(() => {
    if (screen === "hydrant") {
      setLoading(true);
      getHydrant()
        .then((data) => {
          console.log("Fetched hydrant coords:", data);
          setHydrantCoords(data);
        })
        .catch((err) => console.error("Failed to fetch hydrant coords:", err))
        .finally(() => setLoading(false));
    }
  }, [screen]);

  // ✅ Log only the latest DemoMap props when coords change
  useEffect(() => {
    if (coords && coords.origin && coords.destination) {
      console.log("DemoMap props:", {
        origin: coords.origin,
        destination: coords.destination,
      });
    }
  }, [coords]);

  // ✅ Socket.io listener for new coordinates (real-time updates)
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

  // ✅ Screen renderer
  const renderScreen = () => {
    switch (screen) {
      case "extract":
        return (
          <View style={{ flex: 1 }}>
            {coords && coords.origin && coords.destination ? (
              <DemoMap destination={coords.destination} />
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
          <View style={{ flex: 1 }}>
            {hydrantCoords &&
            hydrantCoords.origin &&
            hydrantCoords.destination ? (
              <DemoMap destination={hydrantCoords.destination} />
            ) : (
              <View style={styles.centered}>
                <Text>Loading hydrant route...</Text>
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
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  backButtonOverlay: {
    position: "absolute",
    top: 10,
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
