import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const BASE_URL = "http://192.168.10.126:5000";

export default function MoodCheckIn() {
  const [mood, setMood] = useState(3);
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [notes, setNotes] = useState("");
  const [userName, setUserName] = useState("");
  const [dailyInsight, setDailyInsight] = useState(
    "Loading your personalized recommendation...",
  );
  const [patternInsight, setPatternInsight] = useState(
    "Analyzing your mood patterns...",
  );

  const loadDailyInsight = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.email) return;

      const res = await fetch(`${BASE_URL}/daily-insight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail: user.email }),
      });

      const data = await res.json();
      setDailyInsight(
        data.insight ||
          "Track your mood honestly, drink water, and take one short break today.",
      );
    } catch {
      setDailyInsight(
        "Track your mood honestly, drink water, and take one short break today.",
      );
    }
  };

  const loadPatternInsight = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.email) return;

      const res = await fetch(`${BASE_URL}/pattern-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail: user.email }),
      });

      const data = await res.json();
      setPatternInsight(
        data.insight || "Keep tracking your data to discover patterns.",
      );
    } catch {
      setPatternInsight("Keep tracking your data to discover patterns.");
    }
  };

  useEffect(() => {
    const loadUserAndInsights = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (user) {
        setUserName(user.name);
        loadDailyInsight();
        loadPatternInsight();
      }
    };

    loadUserAndInsights();
  }, []);

  const submit = async () => {
    if (!sleepHours.trim()) {
      Alert.alert("Missing info", "Please enter sleep hours.");
      return;
    }

    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.email) {
        Alert.alert("Error", "User not found. Please login again.");
        return;
      }

      const res = await fetch(`${BASE_URL}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: user.email,
          mood,
          sleepHours,
          sleepQuality,
          stressLevel,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "Something went wrong.");
        return;
      }

      Alert.alert("Saved ✅", data.message);
      setSleepHours("");
      setNotes("");
      Keyboard.dismiss();
      loadDailyInsight();
      loadPatternInsight();
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  };

  const numberButtons = (
    selectedValue: number,
    setValue: (value: number) => void,
  ) => (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => setValue(n)}
          style={[styles.btn, selectedValue === n && styles.active]}
        >
          <Text style={styles.text}>{n}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={60}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.greeting}>Hello {userName || "User"} 👋</Text>

          <Text style={styles.title}>How are you feeling today?</Text>

          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>
              AI Daily Recommendation 🌤️
            </Text>
            <Text style={styles.recommendationText}>{dailyInsight}</Text>
          </View>

          <View style={styles.patternCard}>
            <Text style={styles.patternTitle}>Mood Pattern Insight 📊</Text>
            <Text style={styles.recommendationText}>{patternInsight}</Text>
          </View>

          <Text style={styles.label}>Mood (1–5)</Text>
          {numberButtons(mood, setMood)}

          <Text style={styles.label}>Sleep Hours</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 7"
            placeholderTextColor="#B08968"
            value={sleepHours}
            onChangeText={setSleepHours}
            keyboardType="numeric"
            returnKeyType="done"
          />

          <Text style={styles.label}>Sleep Quality (1–5)</Text>
          {numberButtons(sleepQuality, setSleepQuality)}

          <Text style={styles.label}>Stress Level (1–5)</Text>
          {numberButtons(stressLevel, setStressLevel)}

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="What do you have today?"
            placeholderTextColor="#B08968"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />

          <Pressable style={styles.button} onPress={submit}>
            <Text style={styles.buttonText}>Save Check-In</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFF7E6",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 140,
    backgroundColor: "#FFF7E6",
  },
  greeting: {
    color: "#FF6B6B",
    fontSize: 22,
    marginBottom: 10,
    fontWeight: "bold",
  },
  title: {
    color: "#2B2D42",
    fontSize: 24,
    marginBottom: 15,
    fontWeight: "bold",
  },
  recommendationCard: {
    backgroundColor: "#FFE4E1",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFB703",
  },
  patternCard: {
    backgroundColor: "#FFF0B3",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFB703",
  },
  recommendationTitle: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },
  patternTitle: {
    color: "#D97706",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },
  recommendationText: {
    color: "#2B2D42",
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    color: "#2B2D42",
    marginTop: 10,
    fontWeight: "700",
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  btn: {
    borderWidth: 1,
    borderColor: "#FFB703",
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#FFE4E1",
    minWidth: 48,
    alignItems: "center",
  },
  active: {
    backgroundColor: "#FF9F1C",
  },
  text: {
    color: "#2B2D42",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFB703",
    borderRadius: 12,
    padding: 12,
    color: "#2B2D42",
    marginTop: 6,
    backgroundColor: "#FFFFFF",
  },
  notesInput: {
    height: 95,
  },
  button: {
    backgroundColor: "#FF9F1C",
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  buttonText: {
    color: "#2B2D42",
    fontWeight: "bold",
    fontSize: 16,
  },
});
