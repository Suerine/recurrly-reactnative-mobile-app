import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SignIn = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Link href="/(auth)/sign-up">
        <Text className="text-lg font-sans-bold text-accent">
          Create Account
        </Text>
      </Link>
    </View>
  );
};

export default SignIn;
