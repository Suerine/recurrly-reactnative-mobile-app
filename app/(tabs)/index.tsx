import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from "../../constants/images";
import "../../global.css";
import { CreateSubscriptionModal } from "../components/CreateSubscriptionModal";
import ListHeading from "../components/ListHeading";
import SubscriptionCard from "../components/SubscriptionCard";
import UpcomingSubscriptionCard from "../components/UpcomingSubscriptionCard";
import { useSubscriptions } from "../context/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const { subscriptions, addSubscription } = useSubscriptions();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useUser();
  const posthog = usePostHog();

  const userName = user?.fullName || user?.firstName || "Welcome";
  const userImageUrl = user?.imageUrl;

  // Determine correct image source format
  const userImageSource = userImageUrl ? { uri: userImageUrl } : images.avatar;

  const handleSubscriptionPress = (
    id: string,
    name: string,
    category: string | undefined,
  ) => {
    const isExpanding = expandedSubscriptionId !== id;
    setExpandedSubscriptionId(isExpanding ? id : null);
    if (isExpanding) {
      posthog.capture("subscription_card_expanded", {
        subscription_name: name,
        subscription_category: category ?? "unknown",
      });
    }
  };

  const handleCreateSubscription = useCallback(
    (newSubscription: Subscription) => {
      addSubscription(newSubscription);
      posthog.capture("subscription_created", {
        subscription_name: newSubscription.name,
        subscription_category: newSubscription.category ?? "unknown",
        subscription_price: newSubscription.price,
        subscription_frequency: newSubscription.billing,
      });
    },
    [addSubscription, posthog],
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <CreateSubscriptionModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubscription}
      />
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={userImageSource} className="home-avatar" />
                <Text className="home-user-name">{userName}</Text>
              </View>

              <Pressable onPress={() => setShowCreateModal(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              handleSubscriptionPress(item.id, item.name, item.category)
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions found.</Text>
        }
      />
    </SafeAreaView>
  );
}
