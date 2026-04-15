import { styled } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import "../../global.css";
import SubscriptionCard from "../components/SubscriptionCard";
import { useSubscriptions } from "../context/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  resultCount: number;
}

const SearchHeader = React.memo((props: SearchHeaderProps) => (
  <View style={styles.headerContainer}>
    <Text style={styles.title}>Subscriptions</Text>
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search subscriptions..."
        placeholderTextColor="#999"
        value={props.searchQuery}
        onChangeText={props.onSearchChange}
      />
    </View>

    {props.searchQuery.trim() && (
      <Text style={styles.resultCount}>
        {props.resultCount} result
        {props.resultCount !== 1 ? "s" : ""}
      </Text>
    )}
  </View>
));

const SubscriptionsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const { subscriptions } = useSubscriptions();

  // Memoize search handler to prevent keyboard from dismissing on re-render
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Filter subscriptions based on search query
  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return subscriptions;
    }

    const query = searchQuery.toLowerCase().trim();
    return subscriptions.filter((sub) =>
      [sub.name, sub.category, sub.plan, sub.billing]
        .filter((field): field is string => !!field)
        .some((field) => field.toLowerCase().includes(query)),
    );
  }, [searchQuery, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            scrollEnabled={true}
            ListHeaderComponent={
              <SearchHeader
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                resultCount={filteredSubscriptions.length}
              />
            }
            data={filteredSubscriptions}
            renderItem={({ item }) => (
              <SubscriptionCard
                {...item}
                expanded={expandedSubscriptionId === item.id}
                onPress={() =>
                  setExpandedSubscriptionId(
                    expandedSubscriptionId === item.id ? null : item.id,
                  )
                }
              />
            )}
            keyExtractor={(item) => item.id}
            extraData={expandedSubscriptionId}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? "No subscriptions found"
                    : "No subscriptions yet"}
                </Text>
              </View>
            }
          />
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
    color: "#081126", // navy
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#fff8e7", // card
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5d9c3",
    color: "#081126", // navy text
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  separator: {
    height: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default SubscriptionsScreen;
