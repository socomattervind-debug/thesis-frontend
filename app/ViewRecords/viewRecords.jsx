import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getFireIncidentRecords } from "../service/api/fireFighterGetRecords";

export default function ViewRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await getFireIncidentRecords();
        setRecords(data);
      } catch (error) {
        console.error("Failed to fetch records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <View style={styles.wrapper}>
      {/* ✅ Fullscreen Background Image */}
      <ImageBackground
        source={require("../../assets/images/view-record-background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* ✅ Dark overlay for better readability */}
        <View style={styles.overlay} />

        {/* ✅ Actual Content */}
        <View style={styles.container}>
          {loading ? (
            <View style={styles.placeholder}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.placeholderText}>Loading records...</Text>
            </View>
          ) : records.length === 0 ? (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                No incident records yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={records}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.label}>
                    City: <Text style={styles.value}>{item.city}</Text>
                  </Text>
                  <Text style={styles.label}>
                    Barangay: <Text style={styles.value}>{item.barangay}</Text>
                  </Text>
                  <Text style={styles.label}>
                    Address: <Text style={styles.value}>{item.address}</Text>
                  </Text>
                  <Text style={styles.label}>
                    Date: <Text style={styles.value}>{item.date}</Text>
                  </Text>
                  <Text style={styles.label}>
                    Time Start:{" "}
                    <Text style={styles.value}>{item.timeArrival}</Text>
                  </Text>
                  <Text style={styles.label}>
                    Time End:{" "}
                    <Text style={styles.value}>{item.timeFinished}</Text>
                  </Text>
                  <Text style={styles.label}>
                    Cause: <Text style={styles.value}>{item.cause}</Text>
                  </Text>
                  <Text style={styles.label}>
                    Severity:{" "}
                    <Text
                      style={[
                        styles.value,
                        styles.severity,
                        getSeverityStyle(item.severity),
                      ]}
                    >
                      {item.severity}
                    </Text>
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

const getSeverityStyle = (severity) => {
  switch (severity) {
    case "Minor":
      return { color: "#00FF00" };
    case "Moderate":
      return { color: "#FFD700" };
    case "Severe":
      return { color: "#FFA500" };
    case "Critical":
      return { color: "#FF0000" };
    default:
      return { color: "#fff" };
  }
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // optional dark overlay
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 10,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#fff",
  },
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 3,
  },
  value: {
    fontWeight: "bold",
  },
  severity: {
    textTransform: "uppercase",
  },
});
