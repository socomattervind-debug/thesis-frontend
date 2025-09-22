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
import { useRouter } from "expo-router";

export default function FireFighterLogin() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

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
    router.push("/fireFighterRegister/fireFighterRegistration");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <ImageBackground
          source={require("../../assets/images/background-login.png")}
          style={styles.background}
          resizeMode="cover"
        >
          <ScrollView
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={styles.input}
              placeholder="soco.dampalit"
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

            <TouchableOpacity
              onPress={handleSignUp}
              style={styles.signInContainer}
            >
              <Text style={styles.signInText}>
                Don’t have an account?{" "}
                <Text style={styles.signInLink}>Sign Up</Text>
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
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    textAlign: "center",
    position: "relative",
    top: 80,
    borderWidth: 1,
    borderColor: "#fff",
    color: "#fff",
    backgroundColor: "transparent",
  },
  button: {
    width: 250,
    backgroundColor: "#b30d0dff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    position: "relative",
    top: 75,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  signInContainer: { marginTop: 15, position: "relative", top: 70 },
  signInText: { fontSize: 16, color: "#fff" },
  signInLink: { color: "#b30d0dff", fontWeight: "bold" },
});
