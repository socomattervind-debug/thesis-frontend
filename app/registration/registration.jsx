import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Registration() {
  const router = useRouter();

  const handleClientRegister = () => {
    router.push("/clientRegister/clientRegister");
  };

  const handleFireFighter = () => {
    router.push("/fireFighterRegister/fireFighterRegistration");
  };

  const handleSignUpAccount = () => {
    router.push("/loginDashboard/loginDashboard");
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>AS FIRE FIGHTER OR CLIENT</Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={handleFireFighter}>
        <Text style={styles.buttonText}>FIRE FIGHTER</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>OR</Text>

      <TouchableOpacity style={styles.button} onPress={handleClientRegister}>
        <Text style={styles.buttonText}>CLIENT</Text>
      </TouchableOpacity>

      {/* Bottom link */}
      <Text style={styles.bottomText} onPress={handleSignUpAccount}>
        {"have an account?"}
        <Text style={styles.linkText}>SignUp an Account</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#e63946",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#e63946",
    letterSpacing: 1,
    marginBottom: 40,
  },
  button: {
    borderWidth: 1.5,
    borderColor: "#000",
    borderRadius: 30,
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 8,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  orText: {
    color: "#e63946",
    fontSize: 14,
    marginVertical: 8,
  },
  bottomText: {
    fontSize: 14,
    color: "#333",
    marginTop: 40,
    textAlign: "center",
  },
  linkText: {
    color: "#e63946",
    fontWeight: "bold",
  },
});
