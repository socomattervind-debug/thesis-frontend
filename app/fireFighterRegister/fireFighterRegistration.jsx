import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerFireFighter } from "../service/api/RegisterFireFighter";

const { width, height } = Dimensions.get("window");

export default function FireFighterRegistration() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [barangay, setBarangay] = useState("");

  const handleSignUp = async () => {
    if (!fullName || !password || !confirmPassword || !barangay) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    Alert.alert("Sign Up", `Full Name: ${fullName}\nBarangay: ${barangay}`);

    try {
      const data = await registerFireFighter({
        fullName,
        password,
        barangay,
      });
    } catch (error) {
      console.log(error);
    }

    // Reset fields
    setFullName("");
    setPassword("");
    setConfirmPassword("");
    setBarangay("");
    router.ppush("/dashboard/dashboard");
  };

  const handleSignIn = () => {
    router.push("/fireFighterLogin/fireFighterLogin");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <ImageBackground
          source={require("../../assets/images/background-fire-fighter-register.png")}
          style={styles.background}
          resizeMode="cover"
        >
          <ScrollView
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={styles.input}
              placeholder="Username (ex: soco.dampalit)"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#000"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#000"
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#000"
            />

            <TextInput
              style={styles.input}
              placeholder="Barangay"
              value={barangay}
              onChangeText={setBarangay}
              placeholderTextColor="#000"
            />

            {/* Sign Up Button */}
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Clickable Sign In Text */}
            <TouchableOpacity
              onPress={handleSignIn}
              style={styles.signInContainer}
            >
              <Text style={styles.signInText}>
                Already Have an Account?{" "}
                <Text style={styles.signInLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.15,
    paddingBottom: height * 0.1,
  },
  input: {
    width: "80%",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: height * 0.018,
    borderRadius: 10,
    marginBottom: height * 0.02,
    fontSize: width * 0.045,
    textAlign: "center",
    color: "#000",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  button: {
    width: "80%",
    backgroundColor: "#b30d0dff",
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: "center",
    marginTop: height * 0.02,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#161515ff",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  signInContainer: {
    marginTop: height * 0.02,
  },
  signInText: {
    fontSize: width * 0.04,
    color: "#000",
  },
  signInLink: {
    color: "#b30d0dff",
    fontWeight: "bold",
  },
});
