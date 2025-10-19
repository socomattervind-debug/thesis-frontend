import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { fireFighterLogin } from "../service/api/fireFighterLogin";

const { width, height } = Dimensions.get("window");

export default function FireFighterLogin() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!fullName || !password) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const result = await fireFighterLogin(fullName, password);
      console.log(result);
      Alert.alert("Success", "Login successful!");
      router.push("/fireFighterDashboard/fireFighterDashboard");
      setFullName("");
      setPassword("");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/fireFighterRegister/fireFighterRegistration");
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
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="(e.g., soco.dampalit)"
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

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
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
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  formContainer: {
    alignItems: "center",
    paddingHorizontal: width * 0.08,
  },
  input: {
    width: "80%",
    paddingVertical: height * 0.018,
    borderRadius: 10,
    marginBottom: height * 0.025,
    fontSize: width * 0.045,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#fff",
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  button: {
    width: "80%",
    backgroundColor: "#b30d0dff",
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: "center",
    marginTop: height * 0.015,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  signInContainer: {
    marginTop: height * 0.02,
  },
  signInText: {
    fontSize: width * 0.04,
    color: "#fff",
  },
  signInLink: {
    color: "#b30d0dff",
    fontWeight: "bold",
  },
});
