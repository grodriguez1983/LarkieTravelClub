import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { RegistrationScreen } from '../screens/auth/RegistrationScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { WelcomeSuccessScreen } from '../screens/auth/WelcomeSuccessScreen';

const Stack = createStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="WelcomeSuccess" component={WelcomeSuccessScreen} />
    </Stack.Navigator>
  );
};