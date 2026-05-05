import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

const BASE_URL = "http://192.168.10.126:5000";

type Message = {
  sender: "bot" | "user";
  text: string;
};

export default function TabLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hi! I’m MoodSense AI 🌤️ Ask me about your mood, sleep, stress, energy, focus, or daily habits.",
    },
  ]);

  const sendMessage = async () => {
    if (!question.trim()) return;

    const userText = question.trim();
    setQuestion("");

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText },
      { sender: "bot", text: "Typing..." },
    ]);

    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      const res = await fetch(`${BASE_URL}/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userText,
          userEmail: user?.email,
        }),
      });

      const data = await res.json();

      const reply = data?.answer || "I couldn’t generate a response right now.";

      setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            sender: "bot",
            text: reply,
          };
          return updated;
        });
      }, 700);
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "bot",
          text: "I’m having trouble connecting right now. Please try again later.",
        };
        return updated;
      });
    }
  };

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FF6B6B",
          tabBarInactiveTintColor: "#8D6E63",
          tabBarStyle: styles.tabBar,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="house.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={26}
                name="chart.line.uptrend.xyaxis"
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="resources"
          options={{
            title: "Resources",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="book.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="assistant"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <Pressable
        style={styles.floatingButton}
        onPress={() => setChatOpen(true)}
      >
        <Text style={styles.floatingText}>💬</Text>
      </Pressable>

      <Modal visible={chatOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardBox}
          >
            <View style={styles.chatBox}>
              <View style={styles.chatHeader}>
                <View>
                  <Text style={styles.chatTitle}>MoodSense AI</Text>
                  <Text style={styles.chatSubtitle}>
                    Personal wellness assistant
                  </Text>
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={() => setChatOpen(false)}
                >
                  <Text style={styles.close}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.quickQuestions}>
                {["Energy tips", "Reduce stress", "Sleep better"].map(
                  (item) => (
                    <Pressable
                      key={item}
                      style={styles.quickChip}
                      onPress={() => setQuestion(item)}
                    >
                      <Text style={styles.quickChipText}>{item}</Text>
                    </Pressable>
                  ),
                )}
              </View>

              <ScrollView
                style={styles.messages}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((msg, index) => (
                  <View
                    key={index}
                    style={[
                      styles.messageBubble,
                      msg.sender === "user"
                        ? styles.userBubble
                        : styles.botBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.sender === "user" && styles.userMessageText,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Ask me anything..."
                  placeholderTextColor="#B08968"
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                />

                <Pressable style={styles.sendButton} onPress={sendMessage}>
                  <Text style={styles.sendText}>Send</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFF7E6",
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#FFD6A5",
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
  },
  floatingButton: {
    position: "absolute",
    bottom: 86,
    right: 20,
    backgroundColor: "#FF9F1C",
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFF7E6",
  },
  floatingText: {
    fontSize: 27,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(43,45,66,0.38)",
    justifyContent: "flex-end",
  },
  keyboardBox: {
    flex: 1,
    justifyContent: "flex-end",
  },
  chatBox: {
    backgroundColor: "#FFF7E6",
    height: "78%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFD6A5",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FFD6A5",
    marginBottom: 12,
  },
  chatTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2B2D42",
  },
  chatSubtitle: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: "#FFE4E1",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  close: {
    fontSize: 20,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  quickQuestions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  quickChip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFB703",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  quickChipText: {
    color: "#2B2D42",
    fontWeight: "700",
    fontSize: 12,
  },
  messages: {
    flex: 1,
    paddingVertical: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: "86%",
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FFD6A5",
    borderTopLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: "#FF9F1C",
    alignSelf: "flex-end",
    borderTopRightRadius: 6,
  },
  messageText: {
    color: "#2B2D42",
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#FFD6A5",
  },
  input: {
    flex: 1,
    maxHeight: 90,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFB703",
    borderRadius: 16,
    padding: 12,
    color: "#2B2D42",
  },
  sendButton: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginLeft: 8,
  },
  sendText: {
    color: "#2B2D42",
    fontWeight: "bold",
  },
});
