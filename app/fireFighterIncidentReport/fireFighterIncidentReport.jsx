import DateTimePicker from "@react-native-community/datetimepicker"; // 📅 Import Date Picker
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
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
  const [date, setDate] = useState(new Date()); // store as Date object
  const [showDatePicker, setShowDatePicker] = useState(false); // controls calendar visibility
  const [timeArrival, setTimeArrival] = useState("");
  const [timeFinished, setTimeFinished] = useState("");
  const [cause, setCause] = useState("");
  const [severity, setSeverity] = useState("Minor");

  const handleSubmitButton = async () => {
    if (!city.trim()) return Alert.alert("Error", "City is required");
    if (!barangay.trim()) return Alert.alert("Error", "Barangay is required");
    if (!address.trim()) return Alert.alert("Error", "Address is required");
    if (!date) return Alert.alert("Error", "Date is required");

    // format date properly
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
      await addFireIncidentRecord(reportData);
      Alert.alert("Success", "Report submitted successfully!");
      setCity("");
      setBarangay("");
      setAddress("");
      setDate(new Date());
      setTimeArrival("");
      setTimeFinished("");
      setCause("");
      setSeverity("Minor");
    } catch (error) {
      console.error("Submit Error:", error);
      Alert.alert("Error", error.message || "Failed to submit report");
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Incident Report</Text>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.form}>
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

          {/* 📅 Date Picker Field */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: "#333", fontSize: width * 0.04 }}>
              {date
                ? date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Select Date"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="calendar"
              onChange={onChangeDate}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Time of Arrival (e.g. 9:45 AM)"
            value={timeArrival}
            onChangeText={setTimeArrival}
            placeholderTextColor="#333"
          />
          <TextInput
            style={styles.input}
            placeholder="Time Finished (e.g. 10:15 AM)"
            value={timeFinished}
            onChangeText={setTimeFinished}
            placeholderTextColor="#333"
          />
          <TextInput
            style={styles.input}
            placeholder="Cause of Fire"
            value={cause}
            onChangeText={setCause}
            placeholderTextColor="#333"
          />

          {/* Severity Dropdown */}
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
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FF5C3A", // 🔥 orange-red background
    width: "100%",
  },
  title: {
    textAlign: "center",
    fontSize: width * 0.09,
    fontWeight: "bold",
    color: "#fff",
    marginTop: height * 0.08,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: height * 0.05,
  },
  form: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.04,
    fontSize: width * 0.04,
    marginBottom: height * 0.02,
  },
  pickerContainer: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    marginBottom: height * 0.025,
    paddingHorizontal: width * 0.02,
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    fontSize: width * 0.04,
    marginVertical: height * 0.01,
  },
  picker: {
    color: "#000",
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#FFD700",
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: height * 0.015,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
});
