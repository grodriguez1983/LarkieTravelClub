import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Location, PointTransaction, Achievement } from '../types';

const STORAGE_KEYS = {
  USER: 'user_profile',
  LOCATIONS: 'discovered_locations',
  POINT_HISTORY: 'point_history',
  ACHIEVEMENTS: 'user_achievements',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  APP_SETTINGS: 'app_settings',
};

export class StorageService {
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error loading user:', error);
      return null;
    }
  }

  static async updateUserPoints(newBalance: number, totalEarned: number): Promise<void> {
    try {
      const user = await this.getUser();
      if (user) {
        user.pointsBalance = newBalance;
        user.totalPointsEarned = totalEarned;
        await this.saveUser(user);
      }
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  }

  static async saveDiscoveredLocation(location: Location): Promise<void> {
    try {
      const existingLocations = await this.getDiscoveredLocations();
      const updatedLocations = existingLocations.filter(loc => loc.id !== location.id);
      updatedLocations.push({ ...location, discovered: true, discoveredAt: new Date() });
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Error saving discovered location:', error);
    }
  }

  static async getDiscoveredLocations(): Promise<Location[]> {
    try {
      const locationsData = await AsyncStorage.getItem(STORAGE_KEYS.LOCATIONS);
      return locationsData ? JSON.parse(locationsData) : [];
    } catch (error) {
      console.error('Error loading discovered locations:', error);
      return [];
    }
  }

  static async addPointTransaction(transaction: PointTransaction): Promise<void> {
    try {
      const existingHistory = await this.getPointHistory();
      existingHistory.unshift(transaction);
      // Keep only last 50 transactions
      const limitedHistory = existingHistory.slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEYS.POINT_HISTORY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error adding point transaction:', error);
    }
  }

  static async getPointHistory(): Promise<PointTransaction[]> {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.POINT_HISTORY);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Error loading point history:', error);
      return [];
    }
  }

  static async updateAchievement(achievement: Achievement): Promise<void> {
    try {
      const achievements = await this.getAchievements();
      const updatedAchievements = achievements.map(ach => 
        ach.id === achievement.id ? { ...achievement, earned: true, earnedAt: new Date() } : ach
      );
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updatedAchievements));
    } catch (error) {
      console.error('Error updating achievement:', error);
    }
  }

  static async getAchievements(): Promise<Achievement[]> {
    try {
      const achievementsData = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return achievementsData ? JSON.parse(achievementsData) : [];
    } catch (error) {
      console.error('Error loading achievements:', error);
      return [];
    }
  }

  static async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
    } catch (error) {
      console.error('Error setting onboarding status:', error);
    }
  }

  static async getOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return completed ? JSON.parse(completed) : false;
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  static async getAppSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return settings ? JSON.parse(settings) : {
        notificationsEnabled: true,
        larkieMessageFrequency: 'normal',
        soundEnabled: true,
      };
    } catch (error) {
      console.error('Error loading app settings:', error);
      return {
        notificationsEnabled: true,
        larkieMessageFrequency: 'normal',
        soundEnabled: true,
      };
    }
  }

  static async saveAppSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  }
}