import { useRouter } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

export default function Dashboard() {
  const router = useRouter();

  const handleRegistration = () => {
    router.push("/registration/registration");
  };

  const handleLogin = () => {
    router.push("/loginDashboard/loginDashboard");
  };

  const handleAdmin = () => {
    router.push("/adminLogin/adminLogin");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/dashboard-background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centerButtons}>
          <TouchableOpacity style={styles.buttonLogin} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonRegister}
            onPress={handleRegistration}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonAsAdmin} onPress={handleAdmin}>
            <Text style={styles.buttonText}>LOG IN AS ADMIN</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 50,
  },
  centerButtons: {
    alignItems: "center",
    gap: 20,
  },
  buttonLogin: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: 200,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    position: "absolute",
    top: 360,
  },
  buttonRegister: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: 200,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    position: "absolute",
    top: 450,
  },
  buttonAsAdmin: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: 200,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    position: "absolute",
    top: 540,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
