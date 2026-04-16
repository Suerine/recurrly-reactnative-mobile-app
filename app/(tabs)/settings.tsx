import images from "@/constants/images";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const posthog = usePostHog();
  const router = useRouter();

  const [signingOut, setSigningOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const userName = user?.fullName || user?.firstName || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userImage = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      posthog.capture("user_signed_out");
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Sign out failed:", error);
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 🔹 Title */}
        <Text style={styles.title}>Settings</Text>

        {/* 🔹 Profile */}
        <View style={styles.profile}>
          <Image source={userImage} style={styles.avatar} />
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>

        {/* 🔹 Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Pressable
            style={styles.item}
            onPress={() => posthog.capture("edit_profile_clicked")}
          >
            <Text style={styles.itemText}>Edit Profile</Text>
          </Pressable>

          <Pressable
            style={styles.item}
            onPress={() => posthog.capture("change_password_clicked")}
          >
            <Text style={styles.itemText}>Change Password</Text>
          </Pressable>
        </View>

        {/* 🔹 Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.itemRow}>
            <Text style={styles.itemText}>Enable Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                posthog.capture("toggle_notifications", {
                  enabled: value,
                });
              }}
            />
          </View>

          <Pressable
            style={styles.item}
            onPress={() => posthog.capture("currency_clicked")}
          >
            <Text style={styles.itemText}>Currency</Text>
            <Text style={styles.itemValue}>KES</Text>
          </Pressable>
        </View>

        {/* 🔹 Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <Pressable
            style={styles.item}
            onPress={() => posthog.capture("help_clicked")}
          >
            <Text style={styles.itemText}>Help Center</Text>
          </Pressable>

          <Pressable
            style={styles.item}
            onPress={() => posthog.capture("feedback_clicked")}
          >
            <Text style={styles.itemText}>Send Feedback</Text>
          </Pressable>
        </View>

        {/* <Pressable
          style={[
            styles.button,
            styles.buttonDanger,
            signingOut && styles.buttonDisabled,
          ]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Sign out</Text>
          )}
        </Pressable> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff9e3",
  },
  content: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontFamily: "sans-bold",
    color: "#081126",
    marginBottom: 20,
  },

  profile: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },

  name: {
    fontSize: 18,
    fontFamily: "sans-bold",
    color: "#081126",
  },

  email: {
    fontSize: 14,
    color: "#6b7280",
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 10,
  },

  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  itemRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemText: {
    fontSize: 16,
    color: "#081126",
  },

  itemValue: {
    fontSize: 14,
    color: "#9ca3af",
  },

  button: {
    marginTop: "auto",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonDanger: {
    backgroundColor: "#eb3a1e",
  },

  buttonText: {
    fontSize: 16,
    fontFamily: "sans-semibold",
    color: "#fff",
  },

  buttonDisabled: {
    opacity: 0.5,
  },
});

export default Settings;
