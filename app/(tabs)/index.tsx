import { Link } from "expo-router";
import { Text, View } from "react-native";
import ".././global.css";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding">
        <Text className="text-lg font-sans-bold text-accent">Get Started</Text>
      </Link>
      <Link href="/(auth)/sign-in">
        <Text className="text-lg font-sans-bold text-accent">
          Go to Sign In
        </Text>
      </Link>
      <Link href="/(auth)/sign-up">
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
    </View>
  );
}
