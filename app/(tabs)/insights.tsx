import { styled } from "nativewind";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
        {/* 🔹 Title */}
        <Text className="text-2xl font-bold text-primary mb-5">Insights</Text>

        {/* 🔹 Summary Cards */}
        <View className="flex-row justify-between mb-5">
          <View className="bg-white p-4 rounded-2xl w-[48%] shadow">
            <Text className="text-gray-400 text-sm">Monthly Spend</Text>
            <Text className="text-xl font-bold text-primary mt-1">
              KES 4,200
            </Text>
          </View>

          <View className="bg-white p-4 rounded-2xl w-[48%] shadow">
            <Text className="text-gray-400 text-sm">Active Subs</Text>
            <Text className="text-xl font-bold text-primary mt-1">6</Text>
          </View>
        </View>

        {/* 🔹 Spending Trend */}
        <View className="bg-white p-4 rounded-2xl shadow mb-5">
          <Text className="text-base font-semibold text-primary mb-2">
            Spending Trend
          </Text>

          <View className="h-24 items-center justify-center">
            <Text className="text-gray-400">📈 Chart coming soon</Text>
          </View>

          <Text className="text-success mt-2 text-sm">
            +12% from last month
          </Text>
        </View>

        {/* 🔹 Smart Insights */}
        <View className="bg-white p-4 rounded-2xl shadow mb-5">
          <Text className="text-base font-semibold text-primary mb-3">
            Smart Insights
          </Text>

          <View className="mb-3">
            <Text className="text-gray-700">
              💡 You spend the most on Entertainment subscriptions.
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-gray-700">
              ⚠️ 2 subscriptions are rarely used.
            </Text>
          </View>

          <View>
            <Text className="text-gray-700">
              💰 You could save KES 1,200/month by canceling unused services.
            </Text>
          </View>
        </View>

        {/* 🔹 Top Categories */}
        <View className="bg-white p-4 rounded-2xl shadow mb-5">
          <Text className="text-base font-semibold text-primary mb-3">
            Top Categories
          </Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Entertainment</Text>
            <Text className="font-semibold">KES 2,000</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Productivity</Text>
            <Text className="font-semibold">KES 1,200</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Utilities</Text>
            <Text className="font-semibold">KES 1,000</Text>
          </View>
        </View>

        {/* 🔹 Upcoming Warning */}
        <View className="bg-yellow-100 p-4 rounded-2xl">
          <Text className="text-yellow-800 font-semibold">
            ⚠️ Upcoming Charges
          </Text>
          <Text className="text-yellow-700 mt-1">
            You have 3 renewals in the next 5 days.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
