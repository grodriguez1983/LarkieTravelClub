export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: Date;
  membershipLevel: MembershipLevel;
  pointsBalance: number;
  totalPointsEarned: number;
  avatar?: string;
}

export type MembershipLevel = 'Explorer' | 'Adventurer' | 'Pioneer' | 'Legend';

export interface Location {
  id: string;
  name: string;
  description: string;
  category: LocationCategory;
  coordinates: {
    x: number;
    y: number;
  };
  qrCode: string;
  pointValue: number;
  discovered: boolean;
  discoveredAt?: Date;
  operatingHours: string;
  specialOffer?: string;
  tips: string[];
  image: string;
}

export type LocationCategory = 'Restaurant' | 'Bar' | 'Amenity' | 'Hidden Gem' | 'Pool' | 'Lobby' | 'Spa';

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  pointCost: number;
  image: string;
  available: boolean;
  isLarkiePick: boolean;
  termsAndConditions: string;
}

export type RewardCategory = 'Food & Drink' | 'Experiences' | 'Merchandise' | 'Room Upgrades';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
  requirements: string;
  category: AchievementCategory;
}

export type AchievementCategory = 'First Timer' | 'Explorer' | 'Foodie' | 'Social' | 'VIP';

export interface PointTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'expired';
  amount: number;
  description: string;
  location?: string;
  timestamp: Date;
}

export interface LarkieMessage {
  id: string;
  message: string;
  context: 'welcome' | 'discovery' | 'reward' | 'tip' | 'achievement';
  userName: string;
}

export type LarkieImage = 
  | 'larkie-base'
  | 'larkie-logo'
  | 'larkie-vacation'
  | 'larkie-formal'
  | 'larkie-cocktail'
  | 'larkie-explorer'
  | 'larkie-foodie-badge';

export interface NavigationProps {
  navigation: any;
  route: any;
}