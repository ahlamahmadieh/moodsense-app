import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput
} from "react-native";

const BASE_URL = "http://192.168.10.126:5000";

export default function LoginScreen() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password || (isSignup && (!name || !phone))) {
      Alert.alert("Missing info", "Please fill all required fields.");
      return;
    }

    try {
      const endpoint = isSignup ? "/signup" : "/login";

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "Something went wrong.");
        return;
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      Alert.alert("Success", data.message);

      if (isSignup) {
        router.replace("../onboarding");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      Alert.alert("Error", "Network request failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {isSignup ? "Create Account 🌤️" : "Welcome Back 🌤️"}
        </Text>

        {isSignup && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#B08968"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor="#B08968"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#B08968"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#B08968"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {isSignup ? "Sign Up" : "Login"}
          </Text>
        </Pressable>

        <Pressable onPress={() => setIsSignup(!isSignup)}>
          <Text style={styles.switchText}>
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFF7E6",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#2B2D42",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFB703",
    borderRadius: 12,
    padding: 12,
    color: "#2B2D42",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#FF9F1C",
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
  },
  buttonText: {
    color: "#2B2D42",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  switchText: {
    marginTop: 15,
    textAlign: "center",
    color: "#FF6B6B",
    fontWeight: "600",
  },
});
