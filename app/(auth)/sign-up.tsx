import { useSignUp } from "@clerk/expo";
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
import "../../global.css";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_RULES = {
  minLength: {
    test: (p: string) => p.length >= PASSWORD_MIN_LENGTH,
    label: "8+ characters",
  },
  uppercase: {
    test: (p: string) => /[A-Z]/.test(p),
    label: "Uppercase letter",
  },
  number: { test: (p: string) => /[0-9]/.test(p), label: "Number" },
  special: {
    test: (p: string) => /[!@#$%^&*]/.test(p),
    label: "Special character (!@#$%^&*)",
  },
};

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!signUp) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  // Check if we're in verification state
  const isVerificationStep =
    signUp?.status === "missing_requirements" &&
    signUp?.unverifiedFields?.includes("email_address") &&
    signUp?.missingFields?.length === 0;

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
    } else {
      const failedRules = Object.values(PASSWORD_RULES).filter(
        (rule) => !rule.test(password),
      );
      if (failedRules.length > 0) {
        newErrors.password = `Password must include: ${failedRules.map((r) => r.label).join(", ")}`;
      }
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await signUp.create({
        emailAddress: email.trim().toLowerCase(),
      });

      if (error) {
        console.error(JSON.stringify(error, null, 2));
        setErrors({ submit: error.message });
        return;
      }

      const { error: passwordError } = await signUp.password({
        password,
      });

      if (passwordError) {
        console.error(JSON.stringify(passwordError, null, 2));
        setErrors({ submit: passwordError.message });
        return;
      }

      // Send verification email
      const { error: sendError } = await signUp.verifications.sendEmailCode();

      if (sendError) {
        console.error(JSON.stringify(sendError, null, 2));
        setErrors({ submit: sendError.message });
        return;
      }
    } catch (error: any) {
      const errorMessage =
        error?.errors?.[0]?.message ||
        "Failed to create account. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!code.trim()) {
      setErrors({ code: "Verification code is required" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });
      if (error) {
        setErrors({ code: error.message });
        return;
      }
      // Check if verification was successful
      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            const url = decorateUrl("/(tabs)");
            router.replace(url as Href);
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

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await signUp.verifications.sendEmailCode();
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setErrors({ resend: error.message });
        return;
      }
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
  // Verification screen
  if (isVerificationStep) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify your email</Text>
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
              onPress={handleVerifyEmail}
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
              onPress={handleResendCode}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Send new code</Text>
            </Pressable>

            {errors.resend && <Text style={styles.error}>{errors.resend}</Text>}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Sign-up form screen
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Start tracking your subscriptions today
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
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Create a password"
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

            {password && (
              <View style={styles.passwordRules}>
                {Object.entries(PASSWORD_RULES).map(([key, rule]) => {
                  const isMet = rule.test(password);
                  return (
                    <Text
                      key={key}
                      style={[
                        styles.passwordRule,
                        isMet && styles.passwordRuleMet,
                      ]}
                    >
                      {isMet ? "✓" : "○"} {rule.label}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>

          {/* Confirm password field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Confirm your password"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: "" });
                }
              }}
              secureTextEntry
              editable={!loading}
            />
            {errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Submit error */}
          {errors.submit && <Text style={styles.error}>{errors.submit}</Text>}

          {/* Sign-up button */}
          <Pressable
            style={[
              styles.button,
              styles.buttonPrimary,
              (loading || !email || !password || !confirmPassword) &&
                styles.buttonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={loading || !email || !password || !confirmPassword}
          >
            {loading ? (
              <ActivityIndicator color="#081126" size="small" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </Pressable>
        </View>

        {/* Sign-in link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text style={styles.link}>Sign in</Text>
            </Pressable>
          </Link>
        </View>

        {/* Captcha placeholder */}
        <View nativeID="clerk-captcha" />
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
  label: {
    fontSize: 12,
    fontFamily: "sans-semibold",
    color: "#081126",
    marginBottom: 8,
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
  passwordRules: {
    marginTop: 12,
    paddingLeft: 0,
  },
  passwordRule: {
    fontSize: 12,
    fontFamily: "sans-regular",
    color: "rgba(0, 0, 0, 0.6)",
    marginBottom: 4,
  },
  passwordRuleMet: {
    color: "#16a34a",
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
