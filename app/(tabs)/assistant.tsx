import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const BASE_URL = "http://192.168.10.126:5000";

type Entry = {
  id: number;
  mood: number;
  sleep_hours: number;
  sleep_quality: number;
  stress_level: number;
  notes: string;
  created_at: string;
};

export default function AssistantScreen() {
  const [latestEntry, setLatestEntry] = useState<Entry | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const loadLatestEntry = () => {
    fetch(`${BASE_URL}/entries`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setLatestEntry(data[0]);
          setAnswer(generateInsight(data[0]));
        }
      })
      .catch(() => {
        setLatestEntry(null);
      });
  };

  useFocusEffect(
    useCallback(() => {
      loadLatestEntry();
    }, []),
  );

  const generateInsight = (entry: Entry) => {
    if (entry.sleep_hours < 5) {
      return "You slept less than usual. Try drinking water, taking short breaks, eating a balanced meal, and avoiding too much caffeine late in the day.";
    }

    if (entry.stress_level >= 4) {
      return "Your stress level seems high today. Try deep breathing for 2 minutes, breaking tasks into smaller steps, and taking a short walk.";
    }

    if (entry.mood <= 2) {
      return "Your mood seems low today. Try doing one small enjoyable activity, talking to someone you trust, or writing down what is bothering you.";
    }

    if (entry.sleep_quality <= 2) {
      return "Your sleep quality seems low. Try reducing screen time before bed, keeping your room dark, and following a consistent bedtime routine.";
    }

    return "Your check-in looks balanced today. Keep maintaining your habits and continue tracking your mood regularly.";
  };

  const suggestions = latestEntry
    ? [
        latestEntry.sleep_hours < 6
          ? "How can I regain energy today?"
          : "How can I keep my energy stable today?",
        latestEntry.stress_level >= 4
          ? "How can I reduce stress quickly?"
          : "How can I stay calm throughout the day?",
        latestEntry.mood <= 2
          ? "What can I do when my mood is low?"
          : "How can I maintain a good mood?",
      ]
    : [
        "How can I improve my mood today?",
        "How can I sleep better tonight?",
        "How can I manage stress?",
      ];

  const answerQuestion = (text: string) => {
    setQuestion(text);

    const lower = text.toLowerCase();

    if (lower.includes("energy") || lower.includes("tired")) {
      setAnswer(
        "To regain energy, drink water, eat a balanced snack, get sunlight, stretch for 5 minutes, and avoid lying down for too long during the day.",
      );
      return;
    }

    if (lower.includes("stress") || lower.includes("calm")) {
      setAnswer(
        "To reduce stress, try slow breathing, write down your top priorities, take a short walk, and focus on one task at a time.",
      );
      return;
    }

    if (lower.includes("sleep")) {
      setAnswer(
        "To improve sleep, avoid screens before bed, keep a consistent sleep schedule, reduce caffeine late in the day, and create a relaxing bedtime routine.",
      );
      return;
    }

    if (lower.includes("mood") || lower.includes("sad")) {
      setAnswer(
        "To improve mood, try a small enjoyable activity, talk to someone supportive, move your body, and avoid judging yourself for having a difficult day.",
      );
      return;
    }

    setAnswer(
      latestEntry
        ? generateInsight(latestEntry)
        : "Try tracking your mood first so I can give you more personalized suggestions.",
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Assistant 💬</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today’s Insight</Text>
        <Text style={styles.cardText}>
          {latestEntry
            ? answer
            : "No check-in found yet. Add a mood check-in to receive personalized suggestions."}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Suggested Questions</Text>

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            style={styles.questionCard}
            onPress={() => answerQuestion(item)}
          >
            <Text style={styles.questionText}>{item}</Text>
          </Pressable>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Ask something..."
        placeholderTextColor="#B08968"
        value={question}
        onChangeText={setQuestion}
      />

      <Pressable style={styles.button} onPress={() => answerQuestion(question)}>
        <Text style={styles.buttonText}>Ask Assistant</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF7E6",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2B2D42",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFE4E1",
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 8,
  },
  cardText: {
    color: "#2B2D42",
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2B2D42",
    marginBottom: 10,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFB703",
  },
  questionText: {
    color: "#2B2D42",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFB703",
    borderRadius: 12,
    padding: 12,
    color: "#2B2D42",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#FF9F1C",
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#2B2D42",
    fontWeight: "bold",
    fontSize: 16,
  },
});
