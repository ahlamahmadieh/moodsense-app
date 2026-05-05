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
  TextInput,
  View,
} from "react-native";

const BASE_URL = "http://192.168.10.126:5000";

export default function Onboarding() {
  const router = useRouter();

  const [usualSleep, setUsualSleep] = useState("");
  const [activityLevel, setActivityLevel] = useState("Mostly sitting");
  const [workType, setWorkType] = useState("Mental");
  const [energySource, setEnergySource] = useState("Rest");
  const [mainStressor, setMainStressor] = useState("");

  const saveProfile = async () => {
    if (!usualSleep.trim() || !mainStressor.trim()) {
      Alert.alert("Missing info", "Please answer all required questions.");
      return;
    }

    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.email) {
        Alert.alert("Error", "Please login again.");
        return;
      }

      const res = await fetch(`${BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          usualSleep,
          activityLevel,
          workType,
          energySource,
          mainStressor,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "Something went wrong.");
        return;
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  };

  const options = (
    selected: string,
    setSelected: (value: string) => void,
    values: string[],
  ) => (
    <View style={styles.optionRow}>
      {values.map((value) => (
        <Pressable
          key={value}
          style={[
            styles.optionButton,
            selected === value && styles.optionActive,
          ]}
          onPress={() => setSelected(value)}
        >
          <Text style={styles.optionText}>{value}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tell us about you 🌤️</Text>

        <Text style={styles.subtitle}>
          This helps MoodSense understand your normal routine before giving
          advice.
        </Text>

        <Text style={styles.label}>How many hours do you usually sleep?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 7"
          placeholderTextColor="#B08968"
          keyboardType="numeric"
          value={usualSleep}
          onChangeText={setUsualSleep}
        />

        <Text style={styles.label}>How active is your daily routine?</Text>
        {options(activityLevel, setActivityLevel, [
          "Mostly sitting",
          "Mixed",
          "Mostly walking",
        ])}

        <Text style={styles.label}>Is your work/study mostly?</Text>
        {options(workType, setWorkType, ["Mental", "Physical", "Both"])}

        <Text style={styles.label}>How do you usually regain energy?</Text>
        {options(energySource, setEnergySource, [
          "Rest",
          "Food",
          "Exercise",
          "Alone time",
        ])}

        <Text style={styles.label}>What usually stresses you most?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. exams, work, social pressure"
          placeholderTextColor="#B08968"
          value={mainStressor}
          onChangeText={setMainStressor}
        />

        <Pressable style={styles.button} onPress={saveProfile}>
          <Text style={styles.buttonText}>Continue</Text>
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
    backgroundColor: "#FFF7E6",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: "#2B2D42",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#FF6B6B",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
    fontWeight: "600",
  },
  label: {
    color: "#2B2D42",
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFB703",
    borderRadius: 12,
    padding: 12,
    color: "#2B2D42",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    backgroundColor: "#FFE4E1",
    borderWidth: 1,
    borderColor: "#FFB703",
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  optionActive: {
    backgroundColor: "#FF9F1C",
  },
  optionText: {
    color: "#2B2D42",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#FF9F1C",
    padding: 15,
    borderRadius: 14,
    marginTop: 20,
  },
  buttonText: {
    color: "#2B2D42",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
