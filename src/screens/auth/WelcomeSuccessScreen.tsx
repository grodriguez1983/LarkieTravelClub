import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LarkieCharacter } from '../../components/LarkieCharacter';
import { Colors, gradients } from '../../constants/colors';
import { NavigationProps } from '../../types';
import { StorageService } from '../../services/storage';
import { mockUser, mockLocations, mockAchievements, mockPointHistory } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';

interface WelcomeSuccessScreenProps extends NavigationProps {
  route: {
    params: {
      userData: {
        name: string;
        email: string;
        phone: string;
      };
    };
  };
}

interface ImportAnimation {
  type: 'stays' | 'points' | 'profile';
  text: string;
  value: string;
  completed: boolean;
}

export const WelcomeSuccessScreen: React.FC<WelcomeSuccessScreenProps> = ({
  navigation,
  route,
}) => {
  const { userData } = route.params;
  const { setIsAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [importSteps, setImportSteps] = useState<ImportAnimation[]>([
    { type: 'stays', text: 'Importing previous stays', value: '2 stays found', completed: false },
    { type: 'points', text: 'Calculating points earned', value: '340 points imported', completed: false },
    { type: 'profile', text: 'Setting up your profile', value: 'Profile created', completed: false },
  ]);

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Start import animation sequence
    const timer = setTimeout(() => {
      animateImportSteps();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const animateImportSteps = () => {
    const animateStep = (index: number) => {
      if (index >= importSteps.length) {
        // All steps complete - show celebration
        Animated.spring(celebrationAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          setShowButton(true);
          initializeUserData();
        }, 800);
        return;
      }

      setTimeout(() => {
        setImportSteps(prev => 
          prev.map((step, i) => 
            i === index ? { ...step, completed: true } : step
          )
        );

        if (index === 0) setCurrentStep(1);
        else if (index === 1) setCurrentStep(2);
        else if (index === 2) setCurrentStep(3);

        // Move to next step
        setTimeout(() => animateStep(index + 1), 800);
      }, index === 0 ? 0 : 1000);
    };

    animateStep(0);
  };

  const initializeUserData = async () => {
    try {
      // Create user profile with provided data
      const user = {
        ...mockUser,
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        memberSince: new Date(),
        pointsBalance: 340, // Imported points
        totalPointsEarned: 340,
      };

      // Save user data
      await StorageService.saveUser(user);
      
      // Initialize other data
      await StorageService.setOnboardingCompleted(true);
      
      // Save initial locations and achievements
      for (const location of mockLocations) {
        if (location.discovered) {
          await StorageService.saveDiscoveredLocation(location);
        }
      }

      // Save achievements
      const achievements = mockAchievements.map(achievement => 
        achievement.id === '1' 
          ? { ...achievement, earned: true, earnedAt: new Date() }
          : achievement
      );
      await StorageService.saveAppSettings({ achievements });

      // Save initial point history
      for (const transaction of mockPointHistory.slice(0, 3)) {
        await StorageService.addPointTransaction(transaction);
      }

    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  };

  const handleEnterApp = () => {
    console.log('Enter the Club button pressed');
    console.log('setIsAuthenticated function:', typeof setIsAuthenticated);
    
    if (typeof setIsAuthenticated === 'function') {
      console.log('Calling setIsAuthenticated(true)');
      setIsAuthenticated(true);
    } else {
      console.error('setIsAuthenticated is not a function:', setIsAuthenticated);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.deepNavy} />
      
      <LinearGradient
        colors={gradients.success}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Animated.View
              style={{
                transform: [{ scale: celebrationAnim }],
              }}
            >
              <LarkieCharacter
                context="achievement"
                message={`Welcome aboard, ${userData.name.split(' ')[0]}!`}
                userName={userData.name.split(' ')[0]}
                size="large"
                showSpeechBubble={true}
              />
            </Animated.View>
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.title}>Welcome aboard, {userData.name.split(' ')[0]}!</Text>
            <Text style={styles.subtitle}>
              Your Larkie's Travel Club membership is now active
            </Text>
          </View>

          <View style={styles.importContainer}>
            {importSteps.map((step, index) => (
              <Animated.View
                key={step.type}
                style={[
                  styles.importStep,
                  {
                    opacity: currentStep >= index ? 1 : 0.3,
                  },
                ]}
              >
                <View style={styles.stepIcon}>
                  {step.completed ? (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.accent.successGreen} />
                  ) : currentStep === index ? (
                    <View style={styles.loadingDot}>
                      <Animated.View
                        style={[
                          styles.loadingDotInner,
                          {
                            transform: [
                              {
                                scale: celebrationAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.5, 1.2],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    </View>
                  ) : (
                    <View style={styles.pendingDot} />
                  )}
                </View>
                
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>{step.text}</Text>
                  {step.completed && (
                    <Text style={styles.stepValue}>{step.value}</Text>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>

          {showButton && (
            <Animated.View
              style={{
                opacity: celebrationAnim,
                transform: [
                  {
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={styles.enterButton}
                onPress={handleEnterApp}
              >
                <Text style={styles.enterButtonText}>Enter the Club</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: Colors.primary.deepNavy,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  importContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  importStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  stepIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  loadingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary.larkieBlue,
  },
  pendingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    fontWeight: '500',
  },
  stepValue: {
    fontSize: 14,
    color: Colors.accent.successGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.white,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  enterButtonText: {
    color: Colors.primary.deepNavy,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});