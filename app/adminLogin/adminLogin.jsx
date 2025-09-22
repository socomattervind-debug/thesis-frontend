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

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "123") {
      Alert.alert("Success", "Success Login as Admin");
      setUsername("");
      setPassword("");
    } else {
      Alert.alert("Error", "Invalid Credentials");
    }
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
          <Text style={styles.title}>Admin Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Admin Username"
            placeholderTextColor="#fff"
            value={username}
            onChangeText={setUsername}
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
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: "bold",
    color: "#fff",
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
});
