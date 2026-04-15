import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import React, { createContext, useContext, useState } from "react";

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (subscription: Subscription) => void;
  removeSubscription: (id: string) => void;
}

const SubscriptionsContext = createContext<
  SubscriptionsContextType | undefined
>(undefined);

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (subscription: Subscription) => {
    setSubscriptions((prev) => [subscription, ...prev]);
  };

  const updateSubscription = (subscription: Subscription) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === subscription.id ? subscription : sub)),
    );
  };

  const removeSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  };

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        addSubscription,
        updateSubscription,
        removeSubscription,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (context === undefined) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider",
    );
  }
  return context;
}
