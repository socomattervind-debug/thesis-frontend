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
import { validateSignUp } from "../utils/validateSignUp";
import { registerClient } from "../service/api/registerClient";
import { useRouter } from "expo-router";

export default function ClientRegister() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  const handleSignUp = async () => {
    const result = validateSignUp({
      fullName,
      email,
      password,
      confirmPassword,
      phoneNumber,
      address,
    });
    if (!result.valid) {
      Alert.alert("Validation Error", result.message);
      return;
    }
    // All validations passed
    Alert.alert(
      "Sign Up",
      `Full Name: ${fullName}\nEmail: ${email}\nPhone: ${phoneNumber}\nAddress: ${address}`
    );

    console.log(
      `Full Name: ${fullName}\nEmail: ${email}\nPhone: ${phoneNumber}\nAddress: ${address}`
    );

    // for services to api connection
    try {
      const data = await registerClient({
        fullName,
        email,
        password,
        phoneNumber,
        address,
      });
      console.log("Register from server: ", data);
      Alert.alert("Success", data.message);
    } catch (error) {
      console.log(error);
    }
    // Reset fields
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhoneNumber("");
    setAddress("");
  };

  const handleSignIn = () => {
    router.push("/clientLogin/clientLogin");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <ImageBackground
          source={require("../../assets/images/client-background-registration.png")}
          style={styles.background}
          resizeMode="cover"
        >
          <ScrollView
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
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
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
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
  container: {
    flex: 1,
  },
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
    paddingTop: 160, // space on the top
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
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signInContainer: {
    marginTop: 15,
  },
  signInText: {
    fontSize: 16,
    color: "#000",
  },
  signInLink: {
    color: "#b30d0dff",
    fontWeight: "bold",
  },
});
