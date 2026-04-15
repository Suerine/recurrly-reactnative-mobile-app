import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";
import "../../global.css";

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const posthog = usePostHog();

  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMFA, setShowMFA] = useState(false);

  if (!signIn) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  // Check if we're in MFA verification state
  const isMFAStep =
    showMFA ||
    signIn?.status === "needs_client_trust" ||
    signIn?.status === "needs_second_factor";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await signIn.password({
        identifier: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error(JSON.stringify(error, null, 2));
        setErrors({ submit: error.message });
        posthog.capture("user_sign_in_failed", { method: "password" });
        return;
      }

      if (signIn.status === "complete") {
        posthog.capture("user_signed_in", { method: "password" });
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            // Complete any pending sign-in task before navigating
            if (session?.currentTask) {
              console.log("Pending sign-in task:", session.currentTask);
              // Task will be handled by Clerk's session management
            }
            const url = decorateUrl("/(tabs)");
            // Guard against absolute URLs before navigation
            if (url.startsWith("http")) {
              if (typeof window !== "undefined") {
                window.location.href = url;
              }
            } else {
              router.replace(url as Href);
            }
          },
        });
      } else if (signIn.status === "needs_client_trust") {
        const emailFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );
        if (emailFactor) {
          await signIn.mfa.sendEmailCode();
          posthog.capture("user_mfa_started", { method: "otp" });
          setShowMFA(true);
        }
      } else if (signIn.status === "needs_second_factor") {
        const secondFactors = signIn.supportedSecondFactors;
        if (secondFactors && secondFactors.length > 0) {
          const emailFactor = secondFactors.find(
            (factor) => factor.strategy === "email_code",
          );
          if (emailFactor) {
            await signIn.mfa.sendEmailCode();
            posthog.capture("user_mfa_started", { method: "otp" });
            setShowMFA(true);
          } else {
            setErrors({ submit: "Unsupported second factor method" });
          }
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.errors?.[0]?.message ||
        "Invalid email or password. Please try again.";
      setErrors({ submit: errorMessage });
      posthog.capture("user_sign_in_failed", { method: "password" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!code.trim()) {
      setErrors({ code: "Verification code is required" });
      return;
    }

    setLoading(true);
    try {
      await signIn.mfa.verifyEmailCode({ code: code.trim() });

      // Check if verification was successful
      if (signIn.status === "complete") {
        posthog.capture("user_mfa_completed", { method: "otp" });
        posthog.capture("user_signed_in", { method: "password+mfa" });
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            // Complete any pending sign-in task before navigating
            if (session?.currentTask) {
              console.log("Pending sign-in task:", session.currentTask);
              // Task will be handled by Clerk's session management
            }
            const url = decorateUrl("/(tabs)");
            // Guard against absolute URLs before navigation
            if (url.startsWith("http")) {
              if (typeof window !== "undefined") {
                window.location.href = url;
              }
            } else {
              router.replace(url as Href);
            }
          },
        });
      } else {
        setErrors({ code: "Verification failed. Please try again." });
      }
    } catch (error: any) {
      const errorMessage =
        error?.errors?.[0]?.message ||
        "Invalid verification code. Please try again.";
      setErrors({ code: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendMFA = async () => {
    setLoading(true);
    try {
      await signIn.mfa.sendEmailCode();
      setCode("");
      setErrors({});
    } catch (error: any) {
      const errorMessage =
        error?.errors?.[0]?.message ||
        "Failed to resend code. Please try again.";
      setErrors({ resend: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    signIn.reset();
    setEmail("");
    setPassword("");
    setCode("");
    setErrors({});
    setShowMFA(false);
  };

  // MFA verification screen
  if (isMFAStep) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify your identity</Text>
            <Text style={styles.subtitle}>We sent a code to {email}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Verification code</Text>
              <TextInput
                style={[styles.input, errors.code && styles.inputError]}
                placeholder="Enter 6-digit code"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
              {errors.code && <Text style={styles.error}>{errors.code}</Text>}
            </View>

            <Pressable
              style={[
                styles.button,
                styles.buttonPrimary,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleVerifyMFA}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#081126" size="small" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleResendMFA}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Send new code</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleStartOver}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Start over</Text>
            </Pressable>

            {errors.resend && <Text style={styles.error}>{errors.resend}</Text>}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Sign-in form screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
            justifyContent: "center",
          }}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>R</Text>
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText}>Recurrly</Text>
            <Text style={styles.logoSubtitle}>SMART BILLING</Text>
          </View>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to manage your subscriptions
          </Text>
        </View>

        <View style={styles.form}>
          {/* Email field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="you@example.com"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: "" });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}
          </View>

          {/* Password field */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <Pressable disabled>
                <Text style={styles.labelLink}>Forgot?</Text>
              </Pressable>
            </View>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Enter your password"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              secureTextEntry
              editable={!loading}
            />
            {errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}
          </View>

          {/* Submit error */}
          {errors.submit && <Text style={styles.error}>{errors.submit}</Text>}

          {/* Sign-in button */}
          <Pressable
            style={[
              styles.button,
              styles.buttonPrimary,
              (loading || !email || !password) && styles.buttonDisabled,
            ]}
            onPress={handleSignIn}
            disabled={loading || !email || !password}
            testID="sign-in-button"
          >
            {loading ? (
              <ActivityIndicator color="#081126" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        {/* Sign-up link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text style={styles.link}>Create one</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff9e3",
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ea7a53",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 24,
    fontFamily: "sans-extrabold",
    color: "#fff9e3",
    lineHeight: 28,
  },
  logoTextContainer: {
    gap: 2,
  },
  logoText: {
    fontSize: 22,
    fontFamily: "sans-extrabold",
    color: "#081126",
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  logoSubtitle: {
    fontSize: 10,
    fontFamily: "sans-semibold",
    color: "#ea7a53",
    letterSpacing: 2.5,
  },
  header: {
    marginBottom: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "sans-extrabold",
    color: "#081126",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "sans-regular",
    color: "rgba(0, 0, 0, 0.6)",
  },
  form: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: "sans-semibold",
    color: "#081126",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  labelLink: {
    fontSize: 12,
    fontFamily: "sans-semibold",
    color: "#ea7a53",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "sans-regular",
    backgroundColor: "#fff8e7",
    color: "#081126",
  },
  inputError: {
    borderColor: "#dc2626",
  },
  error: {
    fontSize: 12,
    fontFamily: "sans-regular",
    color: "#dc2626",
    marginTop: 6,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: "#ea7a53",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ea7a53",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "sans-semibold",
    color: "#081126",
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontFamily: "sans-semibold",
    color: "#ea7a53",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "sans-regular",
    color: "rgba(0, 0, 0, 0.6)",
  },
  link: {
    fontSize: 14,
    fontFamily: "sans-semibold",
    color: "#ea7a53",
  },
});
