import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const resources = [
  {
    category: "Stress",
    emoji: "🌿",
    links: [
      {
        title: "Stress relievers: Tips to tame stress",
        source: "Mayo Clinic",
        url: "https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress-relievers/art-20047257",
      },
      {
        title: "16 Simple Ways to Relieve Stress",
        source: "Healthline",
        url: "https://www.healthline.com/nutrition/16-ways-relieve-stress-anxiety",
      },
      {
        title: "How to Relax in Stressful Situations",
        source: "PMC",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7349817/",
      },
    ],
  },
  {
    category: "Energy",
    emoji: "⚡",
    links: [
      {
        title: "9 Tips to Boost Energy Naturally",
        source: "Harvard Health",
        url: "https://www.health.harvard.edu/healthbeat/9-tips-to-boost-your-energy-naturally",
      },
      {
        title: "Self-help Tips to Fight Tiredness",
        source: "NHS",
        url: "https://www.nhs.uk/live-well/sleep-and-tiredness/self-help-tips-to-fight-fatigue/",
      },
    ],
  },
  {
    category: "Productivity",
    emoji: "📚",
    links: [
      {
        title: "Understanding and Overcoming Procrastination",
        source: "Princeton University",
        url: "https://mcgraw.princeton.edu/undergraduates/resources/resource-library/understanding-and-overcoming-procrastination",
      },
      {
        title: "How to Stop Procrastinating",
        source: "The Guardian",
        url: "https://www.theguardian.com/wellness/2025/oct/28/how-to-stop-procrastinating-tips",
      },
      {
        title: "10 Ways to Beat Procrastination",
        source: "Chris Bailey",
        url: "https://chrisbailey.com/10-ways-to-beat-procrastination/",
      },
    ],
  },
  {
    category: "Sleep",
    emoji: "🌙",
    links: [
      {
        title: "Doctor’s Guide to Better Sleep",
        source: "YouTube",
        url: "https://www.youtube.com/watch?v=B-ZXQcDEDAc",
      },
      {
        title: "Natural Sleep Aids",
        source: "Johns Hopkins Medicine",
        url: "https://www.hopkinsmedicine.org/health/wellness-and-prevention/natural-sleep-aids-home-remedies-to-help-you-sleep",
      },
      {
        title: "Tips to Sleep Better",
        source: "Healthline",
        url: "https://www.healthline.com/nutrition/17-tips-to-sleep-better",
      },
    ],
  },
];

export default function ResourcesScreen() {
  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert("Error", "This link cannot be opened.");
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Could not open this link.");
    }
  };

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Wellness Resources</Text>
      <Text style={styles.subtitle}>
        Helpful articles and guides for stress, sleep, energy, and productivity.
      </Text>

      {resources.map((section) => (
        <View key={section.category} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {section.emoji} {section.category}
          </Text>

          {section.links.map((link) => (
            <Pressable
              key={link.url}
              style={styles.card}
              onPress={() => openLink(link.url)}
            >
              <Text style={styles.cardTitle}>{link.title}</Text>
              <Text style={styles.cardSource}>{link.source}</Text>
              <Text style={styles.openText}>Open resource →</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFF7E6",
  },
  container: {
    padding: 20,
    paddingBottom: 130,
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
    lineHeight: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: "#FF6B6B",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFD6A5",
  },
  cardTitle: {
    color: "#2B2D42",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardSource: {
    color: "#6C584C",
    fontSize: 13,
    marginBottom: 8,
  },
  openText: {
    color: "#FF9F1C",
    fontWeight: "bold",
    fontSize: 13,
  },
});
