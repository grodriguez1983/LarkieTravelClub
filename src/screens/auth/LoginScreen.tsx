import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LarkieCharacter } from "../../components/LarkieCharacter";
import { Colors } from "../../constants/colors";
import { NavigationProps } from "../../types";
import { StorageService } from "../../services/storage";
import { mockUser } from "../../services/mockData";
import { useAuth } from "../../context/AuthContext";

export const LoginScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { setIsAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const isFormValid = () => {
    return validateEmail(formData.email) && formData.password.length >= 6;
  };

  const handleLogin = async () => {
    if (!isFormValid()) {
      Alert.alert(
        "Invalid Form",
        "Please enter a valid email and password (6+ characters)."
      );
      return;
    }

    setLoading(true);

    try {
      // Simulate login - accept any valid email/password
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check if user exists, if not create with mock data
      let user = await StorageService.getUser();
      if (!user) {
        // Create user with the provided email
        user = {
          ...mockUser,
          id: Date.now().toString(),
          email: formData.email,
          memberSince: new Date(),
        };
        await StorageService.saveUser(user);
      }

      // Navigate to WelcomeSuccess screen
      console.log(
        "setIsAuthenticated from context:",
        typeof setIsAuthenticated
      );

      navigation.navigate("WelcomeSuccess", {
        userData: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.neutral.white}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={Colors.primary.deepNavy}
              />
            </TouchableOpacity>

            <LarkieCharacter
              context="vacation"
              message="Welcome back! Ready to continue your journey?"
              userName="Friend"
              size="medium"
              showSpeechBubble={true}
            />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your adventure with Larkie
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  formData.email.length > 0 && !validateEmail(formData.email)
                    ? styles.inputError
                    : {},
                ]}
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
                placeholder="Enter your email"
                placeholderTextColor={Colors.neutral.gray}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  formData.password.length > 0 && formData.password.length < 6
                    ? styles.inputError
                    : {},
                ]}
                value={formData.password}
                onChangeText={(text) => updateFormData("password", text)}
                placeholder="Enter your password"
                placeholderTextColor={Colors.neutral.gray}
                secureTextEntry
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                !isFormValid() ? styles.loginButtonDisabled : {},
              ]}
              onPress={handleLogin}
              disabled={!isFormValid() || loading}
            >
              <Text
                style={[
                  styles.loginButtonText,
                  !isFormValid() ? styles.loginButtonTextDisabled : {},
                ]}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Text>
              {!loading && isFormValid() && (
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={Colors.neutral.white}
                />
              )}
            </TouchableOpacity>

            <View style={styles.demoNote}>
              <Ionicons
                name="information-circle"
                size={16}
                color={Colors.primary.larkieBlue}
              />
              <Text style={styles.demoNoteText}>
                Demo: Enter any valid email and password (6+ chars)
              </Text>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() =>
                Alert.alert(
                  "Demo Mode",
                  "Password reset would be implemented here."
                )
              }
            >
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signUpLink}
              onPress={() => navigation.navigate("Registration")}
            >
              <Text style={styles.signUpLinkText}>
                Don't have an account?{" "}
                <Text style={styles.linkText}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 20,
    padding: 8,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.gray,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary.deepNavy,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.primary.deepNavy,
    backgroundColor: Colors.neutral.white,
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary.larkieBlue,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.neutral.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  loginButtonTextDisabled: {
    color: Colors.neutral.gray,
  },
  demoNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  demoNoteText: {
    fontSize: 12,
    color: Colors.primary.deepNavy,
    marginLeft: 8,
    flex: 1,
  },
  forgotPasswordLink: {
    alignItems: "center",
    marginBottom: 20,
  },
  signUpLink: {
    alignItems: "center",
  },
  signUpLinkText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: "center",
  },
  linkText: {
    color: Colors.primary.larkieBlue,
    fontWeight: "600",
  },
});
