import { icons } from "@/constants/icons";
import { posthog } from "@/src/config/posthog";
import clsx from "clsx";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import "../../global.css";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#c9a961",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#d4a5a5",
  Cloud: "#a5c9d4",
  Music: "#d4a5c9",
  Other: "#c9c9c9",
};

export const CreateSubscriptionModal = React.forwardRef<
  void,
  CreateSubscriptionModalProps
>(({ visible, onClose, onSubmit }, ref) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("Entertainment");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Subscription name is required";
    }

    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const now = new Date();
      const startDate = new Date();
      const renewalDate = new Date();

      if (frequency === "Monthly") {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      } else {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      }

      const id = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newSubscription: Subscription = {
        id,
        name: name.trim(),
        price: parseFloat(price),
        category,
        status: "active",
        startDate: startDate.toISOString(),
        renewalDate: renewalDate.toISOString(),
        icon: icons.wallet,
        billing: frequency,
        currency: "KSH",
        color: CATEGORY_COLORS[category],
      };

      onSubmit(newSubscription);

      posthog.capture("subscription_created", {
        subscription_id: id,
        subscription_name: name,
        price: parseFloat(price),
        category,
        billing_frequency: frequency,
        currency: "KSH",
      });

      resetForm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.overlayContainer}>
          <Pressable style={styles.overlay} onPress={handleClose} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoiding}
          >
            <View style={styles.modalContainer}>
              <View className="modal-header">
                <Text className="modal-title">New Subscription</Text>
                <Pressable onPress={handleClose} className="modal-close">
                  <Text className="modal_close_text">×</Text>
                </Pressable>
              </View>

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                <View className="modal-body">
                  {/* Name Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Subscription Name</Text>
                    <TextInput
                      style={[
                        styles.authInput,
                        errors.name && styles.authInputError,
                      ]}
                      className={clsx("auth-input", {
                        "auth-input-error": !!errors.name,
                      })}
                      placeholder="e.g., Netflix"
                      value={name}
                      onChangeText={setName}
                      editable={!loading}
                    />
                    {errors.name && (
                      <Text className="auth-error">{errors.name}</Text>
                    )}
                  </View>

                  {/* Price Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Price</Text>
                    <TextInput
                      style={[
                        styles.authInput,
                        errors.price && styles.authInputError,
                      ]}
                      className={clsx("auth-input", {
                        "auth-input-error": !!errors.price,
                      })}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      value={price}
                      onChangeText={setPrice}
                      editable={!loading}
                    />
                    {errors.price && (
                      <Text className="auth-error">{errors.price}</Text>
                    )}
                  </View>

                  {/* Frequency Toggle */}
                  <View className="auth-field">
                    <Text className="auth-label">Billing Frequency</Text>
                    <View className="picker-row">
                      <Pressable
                        onPress={() => setFrequency("Monthly")}
                        disabled={loading}
                        className={clsx("picker-option", {
                          "picker-option-active": frequency === "Monthly",
                        })}
                      >
                        <Text
                          className={clsx("picker-option-text", {
                            "picker-option-text-active":
                              frequency === "Monthly",
                          })}
                        >
                          Monthly
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setFrequency("Yearly")}
                        disabled={loading}
                        className={clsx("picker-option", {
                          "picker-option-active": frequency === "Yearly",
                        })}
                      >
                        <Text
                          className={clsx("picker-option-text", {
                            "picker-option-text-active": frequency === "Yearly",
                          })}
                        >
                          Yearly
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Category Chips */}
                  <View className="auth-field">
                    <Text className="auth-label">Category</Text>
                    <View style={styles.categoryScroll}>
                      {CATEGORIES.map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() => setCategory(cat)}
                          disabled={loading}
                          className={clsx("category-chip", {
                            "category-chip-active": category === cat,
                          })}
                        >
                          <Text
                            className={clsx("category-chip-text", {
                              "category-chip-text-active": category === cat,
                            })}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Submit Button */}
                  <Pressable
                    onPress={handleSubmit}
                    disabled={loading}
                    className={clsx("auth-button", {
                      "auth-button-disabled": loading,
                    })}
                    style={{
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#081126" />
                    ) : (
                      <Text className="auth-button-text">
                        Create Subscription
                      </Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

CreateSubscriptionModal.displayName = "CreateSubscriptionModal";

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardAvoiding: {
    width: "100%",
  },
  modalContainer: {
    maxHeight: "100%",
    backgroundColor: "#32a852",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  authInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderColor: "rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff9e3",
  },
  authInputError: {
    borderColor: "#dc2626",
  },
  categoryScroll: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modal_close_text: {
    alignItems: "center",
    justifyContent: "center",
  },
});
