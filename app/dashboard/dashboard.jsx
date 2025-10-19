import { useRouter } from "expo-router";
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Dashboard() {
  const router = useRouter();

  const handleRegistration = () => {
    router.push("/fireFighterRegister/fireFighterRegistration");
  };

  const handleLogin = () => {
    router.push("/fireFighterLogin/fireFighterLogin");
  };

  const handleAdmin = () => {
    router.push("/ViewRecords/viewRecords");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/dashboard-background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.centerButtons}>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegistration}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleAdmin}>
              <Text style={styles.buttonText}>View All Records</Text>
            </TouchableOpacity>
          </View>
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
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end", // push content downward
    alignItems: "center",
    paddingBottom: height * 0.15, // move buttons lower
    paddingHorizontal: width * 0.1,
  },
  centerButtons: {
    width: "100%",
    alignItems: "center",
    gap: height * 0.03,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    borderRadius: 10,
    width: "70%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#000",
    fontSize: width * 0.045,
    fontWeight: "bold",
    textAlign: "center",
  },
});
