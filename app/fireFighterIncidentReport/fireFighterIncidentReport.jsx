import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { addFireIncidentRecord } from "../service/api/fireFighterAddRecords";

const { width, height } = Dimensions.get("window");

export default function FireFighterIncidentReport() {
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [timeArrival, setTimeArrival] = useState("");
  const [timeFinished, setTimeFinished] = useState("");
  const [cause, setCause] = useState("");
  const [severity, setSeverity] = useState("Minor"); // default value

  const handleSubmitButton = async () => {
    if (!city.trim()) return Alert.alert("Error", "City is required");
    if (!barangay.trim()) return Alert.alert("Error", "Barangay is required");
    if (!address.trim()) return Alert.alert("Error", "Address is required");
    if (!date.trim()) return Alert.alert("Error", "Date is required");

    let formattedDate = date.trim();

    // ✅ Convert YYYY-MM-DD → "Month, Day, Year"
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const dateObj = new Date(date);
      if (!isNaN(dateObj)) {
        formattedDate = dateObj
          .toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          .replace(/ /g, ", ");
      }
    }

    const reportData = {
      city,
      barangay,
      address,
      date: formattedDate,
      timeArrival,
      timeFinished,
      cause,
      severity,
    };

    try {
      const response = await addFireIncidentRecord(reportData);
      console.log("API Response:", response);

      Alert.alert("Success", "Report submitted successfully!");
      setCity("");
      setBarangay("");
      setAddress("");
      setDate("");
      setTimeArrival("");
      setTimeFinished("");
      setCause("");
      setSeverity("Minor");
    } catch (error) {
      console.error("Submit Error:", error);
      Alert.alert("Error", error.message || "Failed to submit report");
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <ImageBackground
        source={require("../../assets/images/fire-fighter-incident-report-background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
            placeholderTextColor="#333"
          />
          <TextInput
            style={styles.input}
            placeholder="Barangay"
            value={barangay}
            onChangeText={setBarangay}
            placeholderTextColor="#333"
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#333"
          />
          <TextInput
            style={styles.input}
            placeholder="Date (e.g. 2025-10-07 or October, 7, 2025)"
            value={date}
            onChangeText={setDate}
            placeholderTextColor="#333"
          />
          <TextInput
            style={styles.input}
            placeholder="Time of Arrival (e.g. 9:45 AM)"
            value={timeArrival}
            onChangeText={setTimeArrival}
            placeholderTextColor="#333"
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            style={styles.input}
            placeholder="Time Finished (e.g. 10:15 AM)"
            value={timeFinished}
            onChangeText={setTimeFinished}
            placeholderTextColor="#333"
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            style={styles.input}
            placeholder="Cause of Fire"
            value={cause}
            onChangeText={setCause}
            placeholderTextColor="#333"
          />

          {/* 🔥 Severity Dropdown */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Severity of Fire:</Text>
            <Picker
              selectedValue={severity}
              onValueChange={(itemValue) => setSeverity(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Minor" value="Minor" />
              <Picker.Item label="Moderate" value="Moderate" />
              <Picker.Item label="Severe" value="Severe" />
              <Picker.Item label="Critical" value="Critical" />
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitButton}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height,
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 120,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  label: {
    color: "#333",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
  picker: {
    width: "100%",
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },
});
