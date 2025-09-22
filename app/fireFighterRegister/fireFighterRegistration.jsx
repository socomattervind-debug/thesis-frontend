import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { registerFireFighter } from "../service/api/RegisterFireFighter";
import { useRouter } from "expo-router";

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

    console.log(
      `Full Name: ${fullName}\nBarangay: ${barangay}\nPassword: ${password}`
    );

    //for services API
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
              placeholder="Username(ex:soco.dampalit)"
              value={fullName}
              onChangeText={setFullName}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Barangay"
              value={barangay}
              onChangeText={setBarangay}
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 50,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 20,
    paddingTop: 95,
  },
  input: {
    width: 250,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    width: 250,
    backgroundColor: "#b30d0dff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  signInContainer: { marginTop: 15 },
  signInText: { fontSize: 16, color: "#000" },
  signInLink: { color: "#b30d0dff", fontWeight: "bold" },
});
