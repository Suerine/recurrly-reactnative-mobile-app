import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import {
  SplashScreen,
  Stack,
  useGlobalSearchParams,
  usePathname,
} from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import "../global.css";
import { posthog } from "../src/config/posthog";
import { SubscriptionsProvider } from "./context/SubscriptionsContext";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Identifies the signed-in user in PostHog using their Clerk user ID.
// Must be inside ClerkProvider and PostHogProvider.
function UserIdentifier() {
  const { user, isLoaded } = useUser();
  const identifiedId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (user && identifiedId.current !== user.id) {
      posthog.identify(user.id, {
        $set_once: { created_at: user.createdAt?.toISOString() ?? null },
      });
      identifiedId.current = user.id;
    } else if (!user && identifiedId.current !== null) {
      posthog.reset();
      identifiedId.current = null;
    }
  }, [user, isLoaded]);

  return null;
}

function RootLayoutInner() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  // Manual screen tracking for Expo Router
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  return (
    <>
      <UserIdentifier />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (fontError) throw fontError;

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#fff9e3" }} />;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PostHogProvider
        client={posthog}
        debug={__DEV__}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ["testID"],
        }}
      >
        <SubscriptionsProvider>
          <RootLayoutInner />
        </SubscriptionsProvider>
      </PostHogProvider>
    </ClerkProvider>
  );
}
