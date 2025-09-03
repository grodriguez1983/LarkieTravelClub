import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import { HomeScreen } from '../screens/main/HomeScreen';
import { MapScreen } from '../screens/main/MapScreen';
import { ScannerScreen } from '../screens/main/ScannerScreen';
import { RewardsScreen } from '../screens/main/RewardsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ScannerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="ScannerMain" 
      component={ScannerScreen}
      options={{
        presentation: 'modal',
      }}
    />
  </Stack.Navigator>
);

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else if (route.name === 'Rewards') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          if (route.name === 'Scanner') {
            return (
              <View style={styles.scannerButton}>
                <Ionicons name={iconName} size={28} color={Colors.neutral.white} />
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary.larkieBlue,
        tabBarInactiveTintColor: Colors.neutral.gray,
        tabBarStyle: {
          backgroundColor: Colors.neutral.white,
          borderTopColor: Colors.neutral.lightGray,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerStack}
        options={{
          tabBarButton: (props) => (
            <View style={styles.scannerTabButton}>
              {props.children}
            </View>
          ),
        }}
      />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  scannerButton: {
    backgroundColor: Colors.primary.larkieBlue,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  scannerTabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});