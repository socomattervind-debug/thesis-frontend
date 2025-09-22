import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";

export default function ClientLogin() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (!fullName || !password) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    Alert.alert("Login", `Full Name: ${fullName}\nPassword: ${password}`);
    console.log("Logging in:", fullName, password);

    setFullName("");
    setPassword("");
  };

  const handleSignUp = () => {
    router.push("/clientRegister/clientRegister");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={require("../../assets/images/background-login.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#fff"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#fff"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* Don't have an account text */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>{"Don't have an account?"}</Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
  },
  input: {
    width: 250,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#fff",
    color: "#fff",
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
  signupContainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  signupText: {
    color: "#fff",
    fontSize: 14,
  },
  signupLink: {
    color: "#b30d0dff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
