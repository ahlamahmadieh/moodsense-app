import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    const setupNotifications = async () => {
      await Notifications.requestPermissionsAsync();
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "MoodSense 🌤️",
          body: "Don’t forget to log your day today!",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 14,
          minute: 0,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "MoodSense 🌙",
          body: "You haven’t logged your day yet — take a minute!",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21,
          minute: 0,
        },
      });
    };

    setupNotifications();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" />
    </Stack>
  );
}
