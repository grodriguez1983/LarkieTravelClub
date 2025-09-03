import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LarkieCharacter } from '../../components/LarkieCharacter';
import { Colors } from '../../constants/colors';
import { NavigationProps } from '../../types';

interface OTPVerificationScreenProps extends NavigationProps {
  route: {
    params: {
      phone: string;
      userData: {
        name: string;
        email: string;
        phone: string;
      };
    };
  };
}

export const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { phone, userData } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits.');
      return;
    }

    setLoading(true);

    // Simulate API verification
    setTimeout(() => {
      setLoading(false);
      // Accept any 6-digit OTP for demo purposes
      navigation.navigate('WelcomeSuccess', { userData });
    }, 2000);
  };

  const handleResendCode = () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    // Restart timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    Alert.alert('Code Sent', 'A new verification code has been sent to your phone.');
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  const formatPhone = (phoneNumber: string) => {
    return phoneNumber.replace(/(\+\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.white} />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary.deepNavy} />
        </TouchableOpacity>
        
        <LarkieCharacter
          context="formal"
          message="Just need to verify it's really you!"
          userName={userData.name.split(' ')[0]}
          size="medium"
          showSpeechBubble={true}
          customImage="larkie-formal"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to{'\n'}
          <Text style={styles.phoneText}>{formatPhone(phone)}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref!)}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : {},
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              autoFocus={index === 0}
              selectTextOnFocus={true}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResendCode}
          disabled={!canResend}
        >
          <Text style={[styles.resendText, !canResend ? styles.resendTextDisabled : {}]}>
            {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            !isOtpComplete ? styles.verifyButtonDisabled : {},
          ]}
          onPress={handleVerify}
          disabled={!isOtpComplete || loading}
        >
          <Text style={[
            styles.verifyButtonText,
            !isOtpComplete ? styles.verifyButtonTextDisabled : {},
          ]}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
          {!loading && isOtpComplete && (
            <Ionicons name="checkmark-circle" size={20} color={Colors.neutral.white} />
          )}
        </TouchableOpacity>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Didn't receive the code?{' '}
            <Text style={styles.helpLinkText}>Check spam folder</Text> or{' '}
            <Text style={styles.helpLinkText}>try a different number</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary.deepNavy,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.gray,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  phoneText: {
    color: Colors.primary.larkieBlue,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.deepNavy,
    backgroundColor: Colors.neutral.white,
  },
  otpInputFilled: {
    borderColor: Colors.primary.larkieBlue,
    backgroundColor: Colors.neutral.lightGray,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 16,
    color: Colors.primary.larkieBlue,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: Colors.neutral.gray,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.larkieBlue,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  verifyButtonDisabled: {
    backgroundColor: Colors.neutral.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  verifyButtonTextDisabled: {
    color: Colors.neutral.gray,
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  helpLinkText: {
    color: Colors.primary.larkieBlue,
    fontWeight: '600',
  },
});