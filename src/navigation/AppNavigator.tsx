import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { Colors } from '../constants/colors';
import { AuthProvider, useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.neutral.white },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const AppNavigator = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};