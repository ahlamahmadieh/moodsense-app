import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

type Entry = {
  id: number;
  mood: number;
  sleep_hours: number;
  sleep_quality: number;
  stress_level: number;
  notes: string;
  created_at: string;
};

const BASE_URL = "http://192.168.10.126:5000";

export default function HistoryScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);

  const loadEntries = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.email) {
        setEntries([]);
        return;
      }

      const res = await fetch(`${BASE_URL}/entries?userEmail=${user.email}`);
      const data = await res.json();

      setEntries(data);
    } catch {
      setEntries([]);
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/entries/${id}`, {
        method: "DELETE",
      });

      setEntries((prev) => prev.filter((item) => item.id !== id));
    } catch {
      Alert.alert("Error", "Could not delete entry.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, []),
  );

  const chartEntries = entries.slice(0, 7).reverse();

  const chartData = {
    labels: chartEntries.map((_, i) => `${i + 1}`),
    datasets: [
      {
        data: chartEntries.length > 0 ? chartEntries.map((e) => e.mood) : [0],
      },
    ],
  };

  const averageMood =
    entries.length > 0
      ? (
          entries.reduce((sum, entry) => sum + Number(entry.mood), 0) /
          entries.length
        ).toFixed(1)
      : "0";

  const averageStress =
    entries.length > 0
      ? (
          entries.reduce((sum, entry) => sum + Number(entry.stress_level), 0) /
          entries.length
        ).toFixed(1)
      : "0";

  const latestEntry = entries[0];

  const moodLabel = (mood: number) => {
    if (mood <= 2) return "Low";
    if (mood === 3) return "Neutral";
    return "Positive";
  };

  const moodEmoji = (mood: number) => {
    if (mood <= 2) return "😔";
    if (mood === 3) return "😐";
    return "😊";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood History</Text>
      <Text style={styles.subtitle}>
        Review your check-ins and notice your wellness patterns.
      </Text>

      {entries.length > 0 && (
        <>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Avg Mood</Text>
              <Text style={styles.summaryValue}>{averageMood}/5</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Avg Stress</Text>
              <Text style={styles.summaryValue}>{averageStress}/5</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Check-ins</Text>
              <Text style={styles.summaryValue}>{entries.length}</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Mood Trend 📈</Text>

            <LineChart
              data={chartData}
              width={Dimensions.get("window").width - 70}
              height={210}
              yAxisInterval={1}
              fromZero
              chartConfig={{
                backgroundColor: "#FFE4E1",
                backgroundGradientFrom: "#FFE4E1",
                backgroundGradientTo: "#FFF0B3",
                decimalPlaces: 0,
                color: () => "#FF6B6B",
                labelColor: () => "#2B2D42",
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#FF9F1C",
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          {latestEntry && (
            <View style={styles.latestCard}>
              <Text style={styles.latestTitle}>Latest Check-In</Text>
              <Text style={styles.latestText}>
                {moodEmoji(latestEntry.mood)} Mood:{" "}
                {moodLabel(latestEntry.mood)} ({latestEntry.mood}/5)
              </Text>
              <Text style={styles.latestText}>
                Sleep: {latestEntry.sleep_hours}h · Quality:{" "}
                {latestEntry.sleep_quality}/5 · Stress:{" "}
                {latestEntry.stress_level}/5
              </Text>
            </View>
          )}
        </>
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.entryCard,
              item.mood <= 2
                ? styles.lowMood
                : item.mood === 3
                  ? styles.neutralMood
                  : styles.goodMood,
            ]}
          >
            <View style={styles.entryHeader}>
              <Text style={styles.entryMood}>
                {moodEmoji(item.mood)} {moodLabel(item.mood)} Mood
              </Text>
              <Text style={styles.entryDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.entryText}>Mood: {item.mood}/5</Text>
            <Text style={styles.entryText}>
              Sleep: {item.sleep_hours} hours
            </Text>
            <Text style={styles.entryText}>
              Sleep Quality: {item.sleep_quality || "Not recorded"}/5
            </Text>
            <Text style={styles.entryText}>
              Stress Level: {item.stress_level || "Not recorded"}/5
            </Text>
            <Text style={styles.entryText}>
              Notes: {item.notes || "No notes"}
            </Text>

            <Text style={styles.entryTime}>
              {new Date(item.created_at).toLocaleString()}
            </Text>

            <Pressable
              style={styles.deleteButton}
              onPress={() => deleteEntry(item.id)}
            >
              <Text style={styles.deleteText}>Delete Entry</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Start by adding your first check-in from the Home screen.
            </Text>
          </View>
        }
      />
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
    color: "#2B2D42",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#6C584C",
    fontSize: 14,
    marginBottom: 18,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFE4E1",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFB703",
  },
  summaryLabel: {
    color: "#6C584C",
    fontSize: 12,
    fontWeight: "600",
  },
  summaryValue: {
    color: "#FF6B6B",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: "#FFE4E1",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFB703",
    marginBottom: 14,
  },
  chartTitle: {
    color: "#2B2D42",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
  },
  latestCard: {
    backgroundColor: "#FFF0B3",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFB703",
    marginBottom: 14,
  },
  latestTitle: {
    color: "#D97706",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  latestText: {
    color: "#2B2D42",
    fontSize: 14,
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 130,
  },
  entryCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFD6A5",
  },
  lowMood: {
    borderLeftWidth: 7,
    borderLeftColor: "#FF6B6B",
  },
  neutralMood: {
    borderLeftWidth: 7,
    borderLeftColor: "#FFD43B",
  },
  goodMood: {
    borderLeftWidth: 7,
    borderLeftColor: "#FF9F1C",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  entryMood: {
    color: "#2B2D42",
    fontSize: 16,
    fontWeight: "bold",
  },
  entryDate: {
    color: "#6C584C",
    fontSize: 12,
    fontWeight: "600",
  },
  entryText: {
    color: "#2B2D42",
    fontSize: 14,
    marginBottom: 4,
  },
  entryTime: {
    color: "#8D6E63",
    fontSize: 12,
    marginTop: 6,
  },
  deleteButton: {
    backgroundColor: "#FFE4E1",
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  deleteText: {
    color: "#D62828",
    fontWeight: "bold",
  },
  emptyCard: {
    backgroundColor: "#FFE4E1",
    padding: 22,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFB703",
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 38,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#2B2D42",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  emptyText: {
    color: "#6C584C",
    textAlign: "center",
    lineHeight: 20,
  },
});
