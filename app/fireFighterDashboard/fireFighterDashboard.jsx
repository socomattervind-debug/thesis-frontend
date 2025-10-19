import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  Dimensions,
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

const { width, height } = Dimensions.get("window");

export default function FireFighterDashboard({ navigation }) {
  const [screen, setScreen] = useState("dashboard");
  const [coords, setCoords] = useState(null);
  const [hydrantCoords, setHydrantCoords] = useState(null);
  const [hydrants, setHydrants] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const AUTO_LOGOUT_TIME = 2 * 60 * 1000; // 2 minutes
  const inactivityTimer = useRef(null);

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
        .then((data) => setCoords(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [screen]);

  // ✅ Real-time socket updates
  useEffect(() => {
    const socket = io("https://thesis-backend-zk2j.onrender.com");

    socket.on("coordinatesUpdated", (newCoord) => {
      setCoords({
        origin: {
          latitude: newCoord.origin.latitude,
          longitude: newCoord.origin.longitude,
        },
        destination: {
          latitude: newCoord.destination.latitude,
          longitude: newCoord.destination.longitude,
        },
      });
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
      console.error(err);
      Alert.alert("Error", "Failed to fetch hydrant routes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (screen === "hydrant" && origin) {
      fetchHydrantRoutes();
    }
  }, [screen, origin]);

  // Hardware Back Action
  useEffect(() => {
    const backAction = () => {
      if (screen === "hydrant" && hydrantCoords) {
        setHydrantCoords(null);
        return true;
      } else if (screen !== "dashboard") {
        setScreen("dashboard");
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [screen, hydrantCoords]);

  // ✅ Logout function
  const handleLogout = (type = "manual") => {
    if (type === "manual") {
      Alert.alert(
        "Confirm Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              console.log("✅ User logged out manually.");
              router.replace("/fireFighterLogin/fireFighterLogin");
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert(
        "Session Expired",
        "You have been logged out due to inactivity."
      );
      console.log("⏰ Auto logout due to inactivity.");
      router.replace("/fireFighterLogin/fireFighterLogin");
    }
  };

  // reset timer for time out
  const resetTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(
      () => handleLogout("auto"),
      AUTO_LOGOUT_TIME
    );
  };

  // ✅ Setup auto logout on inactivity
  useEffect(() => {
    resetTimer();
    const subscription = AppState.addEventListener("change", resetTimer);
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      subscription.remove();
    };
  }, []);

  // ✅ Screen Renderer
  const renderScreen = () => {
    switch (screen) {
      case "extract":
        return (
          <View style={{ flex: 1 }}>
            {coords?.destination ? (
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
          </View>
        );

      case "hydrant":
        return (
          <View style={{ flex: 1, padding: width * 0.025 }}>
            {!hydrantCoords ? (
              <View style={styles.centered}>
                <Text
                  style={[
                    styles.hydrantHeader,
                    { marginTop: height * 0.15, fontSize: width * 0.06 },
                  ]}
                >
                  Choose a Fire Hydrant Location:
                </Text>
                {loading ? (
                  <ActivityIndicator size="large" color="#b30d0d" />
                ) : (
                  hydrants.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.hydrantOption,
                        { padding: height * 0.015 },
                      ]}
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
                      <Text
                        style={[styles.hydrantText, { fontSize: width * 0.04 }]}
                      >
                        💧 {item.name}{" "}
                        <Text
                          style={{ color: "#555", fontSize: width * 0.035 }}
                        >
                          (Distance: {item.distance} km • {item.duration} mins)
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ) : (
              <DemoMap destination={hydrantCoords.destination} type="hydrant" />
            )}
          </View>
        );

      case "records":
        return (
          <View style={styles.screen}>
            <FireFighterIncidentReport />
          </View>
        );

      default:
        return (
          <SafeAreaView style={styles.dashboard}>
            <Text
              style={[
                styles.header,
                { fontSize: width * 0.07, marginBottom: height * 0.05 },
              ]}
            >
              🔥 Firefighter Dashboard
            </Text>
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
            <DashboardButton
              text="🚪 Logout"
              onPress={() => handleLogout("manual")}
            />
          </SafeAreaView>
        );
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}

// ✅ Reusable Components
const DashboardButton = ({
  text,
  onPress,
  heightMultiplier = 0.06,
  widthPercentage = 0.7,
}) => (
  <TouchableOpacity
    style={[
      styles.card,
      {
        paddingVertical: height * heightMultiplier,
        width: `${widthPercentage * 100}%`,
      },
    ]}
    onPress={onPress}
  >
    <Text style={[styles.cardText, { fontSize: width * 0.04 }]}>{text}</Text>
  </TouchableOpacity>
);

// ✅ Styles
const styles = StyleSheet.create({
  dashboard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: width * 0.05,
    backgroundColor: "#f4f6f9",
  },
  header: {
    fontWeight: "bold",
    color: "#b30d0d",
  },
  card: {
    width: "80%",
    backgroundColor: "#fff",
    marginBottom: height * 0.02,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  cardText: {
    fontWeight: "600",
    color: "#333",
  },
  centered: { alignItems: "center" },
  hydrantOption: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: height * 0.01,
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  hydrantText: { fontWeight: "600", color: "#333" },
  hydrantHeader: {
    fontWeight: "700",
    marginBottom: height * 0.02,
    color: "#b30d0d",
    textAlign: "center",
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
});
