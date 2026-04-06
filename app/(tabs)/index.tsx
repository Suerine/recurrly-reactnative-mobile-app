import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import ".././global.css";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="mt-4 rounded bg-primary p-4">
        <Text className="text-lg font-sans-bold text-accent">Get Started</Text>
      </Link>
      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary p-4">
        <Text className="text-lg font-sans-bold text-accent">
          Go to Sign In
        </Text>
      </Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary p-4">
        <Text className="text-lg font-sans-bold text-accent">Get Sign Up</Text>
      </Link>
      <Link href="/subscriptions/spotify">
        <Text className="text-lg font-sans-bold text-accent">
          Spotify Subscriptions
        </Text>
      </Link>
      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
      >
        <Text className="text-lg font-sans-bold text-accent">
          Claude Max Subscription
        </Text>
      </Link>
    </SafeAreaView>
  );
}
