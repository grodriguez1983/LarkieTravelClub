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

export const RegistrationScreen: React.FC<NavigationProps> = ({
  navigation,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasExistingReservation, setHasExistingReservation] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validatePhone = (phone: string) => {
    return phone.match(/^\+?[\d\s\-\(\)]+$/) && phone.length >= 10;
  };

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      validateEmail(formData.email) &&
      validatePhone(formData.phone) &&
      agreedToTerms
    );
  };

  const handleRegistration = () => {
    if (!isFormValid()) {
      Alert.alert(
        "Invalid Form",
        "Please fill all fields correctly and agree to terms."
      );
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.navigate("OTPVerification", {
        phone: formData.phone,
        userData: formData,
      });
    }, 1500);
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
              message="Welcome aboard! Let's get you set up!"
              userName={formData.name || "Friend"}
              size="medium"
              showSpeechBubble={true}
            />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Join Larkie's Travel Club and start earning rewards!
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  formData.name.length > 0 && formData.name.length < 2
                    ? styles.inputError
                    : {},
                ]}
                value={formData.name}
                onChangeText={(text) => updateFormData("name", text)}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.neutral.gray}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address *</Text>
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
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[
                  styles.input,
                  formData.phone.length > 0 && !validatePhone(formData.phone)
                    ? styles.inputError
                    : {},
                ]}
                value={formData.phone}
                onChangeText={(text) => updateFormData("phone", text)}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={Colors.neutral.gray}
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={styles.reservationToggle}
              onPress={() => setHasExistingReservation(!hasExistingReservation)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    hasExistingReservation ? styles.checkboxActive : {},
                  ]}
                >
                  {hasExistingReservation && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={Colors.neutral.white}
                    />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  Link with existing reservation
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    agreedToTerms ? styles.checkboxActive : {},
                  ]}
                >
                  {agreedToTerms && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={Colors.neutral.white}
                    />
                  )}
                </View>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.checkboxText}>
                    I agree to the{" "}
                    <Text style={styles.linkText}>Terms & Conditions</Text> and{" "}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.createAccountButton,
                !isFormValid() ? styles.createAccountButtonDisabled : {},
              ]}
              onPress={handleRegistration}
              disabled={!isFormValid() || loading}
            >
              <Text
                style={[
                  styles.createAccountButtonText,
                  !isFormValid() ? styles.createAccountButtonTextDisabled : {},
                ]}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
              {!loading && (
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={
                    !isFormValid() ? Colors.neutral.gray : Colors.neutral.white
                  }
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{" "}
                <Text style={styles.linkText}>Sign In</Text>
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
  reservationToggle: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.neutral.gray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: Colors.primary.larkieBlue,
    borderColor: Colors.primary.larkieBlue,
  },
  checkboxText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    flex: 1,
    lineHeight: 20,
  },
  termsContainer: {
    marginBottom: 30,
  },
  termsTextContainer: {
    flex: 1,
  },
  linkText: {
    color: Colors.primary.larkieBlue,
    fontWeight: "600",
  },
  createAccountButton: {
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
  createAccountButtonDisabled: {
    backgroundColor: Colors.neutral.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  createAccountButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  createAccountButtonTextDisabled: {
    color: Colors.neutral.gray,
  },
  loginLink: {
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: "center",
  },
});
