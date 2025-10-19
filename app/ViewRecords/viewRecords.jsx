import DateTimePicker from "@react-native-community/datetimepicker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getFireIncidentRecords } from "../service/api/fireFighterGetRecords";

const { width } = Dimensions.get("window");

export default function ViewRecords() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [citySearch, setCitySearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ✅ Fetch Fire Incident Records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await getFireIncidentRecords();
        setRecords(response);
        setFilteredRecords(response);
      } catch (error) {
        console.error("Error fetching records:", error);
        Alert.alert("Error", "Failed to fetch records.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // ✅ Date Filter Function
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  // ✅ Filter Logic
  const handleFilter = () => {
    let filtered = [...records];

    if (citySearch.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.city.toLowerCase().includes(citySearch.toLowerCase())
      );
    }

    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      filtered = filtered.filter((item) => item.date === formattedDate);
    }

    if (filtered.length === 0) {
      Alert.alert("No Records", "No records found for your filter.");
    }

    setFilteredRecords(filtered);
  };

  // ✅ Reset Filters
  const handleViewAll = () => {
    setFilteredRecords(records);
    setCitySearch("");
    setSelectedDate(null);
  };

  // ✅ Export Records as PDF
  const handleExportPDF = async () => {
    if (filteredRecords.length === 0) {
      Alert.alert("No Data", "There are no records to export.");
      return;
    }

    const html = `
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1 style="text-align:center;">Fire Incident Report</h1>
          <p style="text-align:center;">Generated on: ${new Date().toLocaleString()}</p>
          ${filteredRecords
            .map(
              (item, index) => `
              <div style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                <h3>Record #${index + 1}</h3>
                <p><strong>City:</strong> ${item.city}</p>
                <p><strong>Barangay:</strong> ${item.barangay}</p>
                <p><strong>Address:</strong> ${item.address}</p>
                <p><strong>Date:</strong> ${item.date}</p>
                <p><strong>Start Time:</strong> ${item.timeArrival}</p>
                <p><strong>End Time:</strong> ${item.timeFinished}</p>
                <p><strong>Cause:</strong> ${item.cause}</p>
                <p><strong>Severity:</strong> ${item.severity}</p>
              </div>
            `
            )
            .join("")}
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("PDF Generated", `PDF saved at: ${uri}`);
      }
    } catch (error) {
      console.error("PDF Export failed:", error);
      Alert.alert("Error", "Failed to export PDF.");
    }
  };

  // ✅ Render Each Record
  const renderItem = ({ item, index }) => (
    <View style={styles.recordContainer}>
      <Text style={styles.recordTitle}>Record #{index + 1}</Text>
      <Text style={styles.recordText}>City: {item.city}</Text>
      <Text style={styles.recordText}>Barangay: {item.barangay}</Text>
      <Text style={styles.recordText}>Address: {item.address}</Text>
      <Text style={styles.recordText}>Date: {item.date}</Text>
      <Text style={styles.recordText}>Start Time: {item.timeArrival}</Text>
      <Text style={styles.recordText}>End Time: {item.timeFinished}</Text>
      <Text style={styles.recordText}>Cause: {item.cause}</Text>
      <Text style={styles.recordText}>Severity: {item.severity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Fire Incident Records 🔥</Text>

      {/* 🔍 Filter Section */}
      <View style={styles.filterContainer}>
        <View style={styles.cityFilterBox}>
          <TextInput
            style={styles.cityInput}
            placeholder="Enter City (e.g. Malabon)"
            placeholderTextColor="#eee"
            value={citySearch}
            onChangeText={setCitySearch}
          />

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.cityButtonText}>
              {selectedDate
                ? selectedDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Pick Date"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterButtons}>
          <TouchableOpacity style={styles.cityButton} onPress={handleFilter}>
            <Text style={styles.cityButtonText}>Apply Filter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={handleViewAll}
          >
            <Text style={styles.cityButtonText}>View All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
        />
      )}

      {/* 🔥 Record List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* 📄 Export Button */}
      <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
        <Text style={styles.exportButtonText}>Export as PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8B0000",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },
  filterContainer: {
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 10,
    borderRadius: 10,
  },
  cityFilterBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cityInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    color: "#fff",
    height: 40,
  },
  dateButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  cityButton: {
    flex: 1,
    backgroundColor: "#FF6347",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  viewAllButton: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cityButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  recordContainer: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#b22222",
    marginBottom: 5,
  },
  recordText: { fontSize: 14, color: "#333" },
  exportButton: {
    backgroundColor: "#b22222",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: width * 0.8,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
