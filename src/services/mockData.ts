import { User, Location, Reward, Achievement, PointTransaction, MembershipLevel } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 (555) 123-4567',
  memberSince: new Date('2023-06-15'),
  membershipLevel: 'Explorer',
  pointsBalance: 1250,
  totalPointsEarned: 2840,
};

export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Pool Bar',
    description: 'Refreshing drinks with a view of the infinity pool',
    category: 'Bar',
    coordinates: { x: 0.3, y: 0.7 },
    qrCode: 'POOL_BAR_001',
    pointValue: 75,
    discovered: true,
    discoveredAt: new Date('2024-08-28'),
    operatingHours: '10:00 AM - 10:00 PM',
    specialOffer: 'Happy Hour 4-6 PM: 20% off all cocktails',
    tips: ['Try the spicy margarita!', 'Best sunset views around 6:30 PM'],
    image: 'pool-bar.jpg',
  },
  {
    id: '2',
    name: 'Rooftop Restaurant',
    description: 'Fine dining with panoramic city views',
    category: 'Restaurant',
    coordinates: { x: 0.5, y: 0.2 },
    qrCode: 'ROOFTOP_REST_001',
    pointValue: 100,
    discovered: false,
    operatingHours: '6:00 PM - 11:00 PM',
    tips: ['Make reservations in advance', 'Ask for table by the windows'],
    image: 'rooftop-restaurant.jpg',
  },
  {
    id: '3',
    name: 'Spa Relaxation Area',
    description: 'Tranquil space for ultimate relaxation',
    category: 'Spa',
    coordinates: { x: 0.8, y: 0.4 },
    qrCode: 'SPA_RELAX_001',
    pointValue: 50,
    discovered: true,
    discoveredAt: new Date('2024-08-30'),
    operatingHours: '7:00 AM - 9:00 PM',
    tips: ['Complimentary herbal tea available', 'Bring flip-flops for hygiene'],
    image: 'spa-area.jpg',
  },
  {
    id: '4',
    name: 'Secret Garden Lounge',
    description: 'Hidden gem with intimate seating among greenery',
    category: 'Hidden Gem',
    coordinates: { x: 0.2, y: 0.3 },
    qrCode: 'SECRET_GARDEN_001',
    pointValue: 150,
    discovered: false,
    operatingHours: '5:00 PM - 1:00 AM',
    tips: ['Perfect for romantic evenings', 'Try the signature botanical cocktails'],
    image: 'secret-garden.jpg',
  },
  {
    id: '5',
    name: 'Main Lobby',
    description: 'Grand entrance with concierge services',
    category: 'Lobby',
    coordinates: { x: 0.5, y: 0.5 },
    qrCode: 'MAIN_LOBBY_001',
    pointValue: 25,
    discovered: true,
    discoveredAt: new Date('2024-08-27'),
    operatingHours: '24/7',
    tips: ['Concierge can help with dinner reservations', 'Free WiFi password: LarkiesWifi2024'],
    image: 'main-lobby.jpg',
  },
  {
    id: '6',
    name: 'Fitness Center',
    description: 'State-of-the-art equipment with city views',
    category: 'Amenity',
    coordinates: { x: 0.7, y: 0.6 },
    qrCode: 'FITNESS_CENTER_001',
    pointValue: 40,
    discovered: false,
    operatingHours: '5:00 AM - 11:00 PM',
    tips: ['Towels and water bottles provided', 'Personal trainer available by appointment'],
    image: 'fitness-center.jpg',
  }
];

export const mockRewards: Reward[] = [
  {
    id: '1',
    name: 'Signature Cocktail',
    description: 'Any signature cocktail from our pool bar',
    category: 'Food & Drink',
    pointCost: 200,
    image: 'cocktail-reward.jpg',
    available: true,
    isLarkiePick: true,
    termsAndConditions: 'Valid at Pool Bar only. Cannot be combined with other offers.',
  },
  {
    id: '2',
    name: 'Room Upgrade',
    description: 'Complimentary upgrade to next room category (subject to availability)',
    category: 'Room Upgrades',
    pointCost: 800,
    image: 'room-upgrade.jpg',
    available: true,
    isLarkiePick: false,
    termsAndConditions: 'Subject to availability. Must be requested at check-in.',
  },
  {
    id: '3',
    name: 'Larkie Plush Toy',
    description: 'Adorable Larkie mascot plush toy to remember your stay',
    category: 'Merchandise',
    pointCost: 300,
    image: 'larkie-plush.jpg',
    available: true,
    isLarkiePick: false,
    termsAndConditions: 'Pick up from front desk. One per guest.',
  },
  {
    id: '4',
    name: 'Spa Treatment (30min)',
    description: '30-minute relaxation massage at our spa',
    category: 'Experiences',
    pointCost: 600,
    image: 'spa-treatment.jpg',
    available: true,
    isLarkiePick: true,
    termsAndConditions: 'Appointment required. Subject to therapist availability.',
  },
  {
    id: '5',
    name: 'Late Checkout',
    description: 'Extend your stay until 4:00 PM',
    category: 'Room Upgrades',
    pointCost: 150,
    image: 'late-checkout.jpg',
    available: true,
    isLarkiePick: false,
    termsAndConditions: 'Subject to availability. Request at front desk.',
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Scan your first QR code',
    icon: 'walk',
    earned: true,
    earnedAt: new Date('2024-08-27'),
    requirements: 'Scan any QR code for the first time',
    category: 'First Timer',
  },
  {
    id: '2',
    name: 'Explorer',
    description: 'Discover 5 different locations',
    icon: 'map',
    earned: false,
    requirements: 'Scan QR codes at 5 different locations',
    category: 'Explorer',
  },
  {
    id: '3',
    name: 'Social Butterfly',
    description: 'Share your achievements on social media',
    icon: 'share',
    earned: false,
    requirements: 'Share any achievement on social media',
    category: 'Social',
  },
  {
    id: '4',
    name: 'Foodie Friend',
    description: 'Visit all restaurant and bar locations',
    icon: 'restaurant',
    earned: false,
    requirements: 'Discover all food & beverage locations',
    category: 'Foodie',
  },
  {
    id: '5',
    name: 'VIP Member',
    description: 'Reach Legend membership status',
    icon: 'star',
    earned: false,
    requirements: 'Accumulate 5000 total points',
    category: 'VIP',
  }
];

export const mockPointHistory: PointTransaction[] = [
  {
    id: '1',
    type: 'earned',
    amount: 75,
    description: 'QR code scanned at Pool Bar',
    location: 'Pool Bar',
    timestamp: new Date('2024-08-30T14:30:00'),
  },
  {
    id: '2',
    type: 'earned',
    amount: 50,
    description: 'QR code scanned at Spa',
    location: 'Spa Relaxation Area',
    timestamp: new Date('2024-08-30T10:15:00'),
  },
  {
    id: '3',
    type: 'redeemed',
    amount: -200,
    description: 'Signature Cocktail redeemed',
    timestamp: new Date('2024-08-29T18:45:00'),
  },
  {
    id: '4',
    type: 'bonus',
    amount: 100,
    description: 'First-time visitor bonus',
    timestamp: new Date('2024-08-27T16:00:00'),
  },
  {
    id: '5',
    type: 'earned',
    amount: 25,
    description: 'QR code scanned at Main Lobby',
    location: 'Main Lobby',
    timestamp: new Date('2024-08-27T15:30:00'),
  }
];

export const getMembershipLevelInfo = (level: MembershipLevel) => {
  const levels = {
    Explorer: {
      color: '#5DADE2',
      nextLevel: 'Adventurer',
      pointsRequired: 500,
      benefits: ['5% discount on food & drinks', 'Mobile check-in'],
    },
    Adventurer: {
      color: '#58D68D',
      nextLevel: 'Pioneer',
      pointsRequired: 1500,
      benefits: ['10% discount on food & drinks', 'Late checkout until 2 PM', 'Priority restaurant reservations'],
    },
    Pioneer: {
      color: '#F39C12',
      nextLevel: 'Legend',
      pointsRequired: 3000,
      benefits: ['15% discount on food & drinks', 'Late checkout until 4 PM', 'Complimentary room upgrade (when available)', 'Access to VIP lounge'],
    },
    Legend: {
      color: '#8E44AD',
      nextLevel: null,
      pointsRequired: 5000,
      benefits: ['20% discount on food & drinks', 'Guaranteed late checkout until 6 PM', 'Priority room upgrades', 'Personal concierge service', 'Exclusive Legend events'],
    },
  };

  return levels[level];
};

export const getLarkieMessages = (userName: string, context: string) => {
  const messages = {
    welcome: [
      `Hey ${userName}! Ready to explore the hotel with me?`,
      `Welcome back, ${userName}! What adventure shall we go on today?`,
      `${userName}, I've been waiting for you! Let's discover something new!`,
    ],
    discovery: [
      `Great find, ${userName}! You're becoming quite the explorer!`,
      `${userName}, you discovered another location! Keep it up!`,
      `Wow ${userName}, you're on fire! This place has amazing views!`,
    ],
    reward: [
      `${userName}, you've earned enough points for something special!`,
      `Time to treat yourself, ${userName}! Check out these rewards!`,
      `${userName}, your hard work is paying off! What will you redeem?`,
    ],
    tip: [
      `Psst, ${userName}! I heard the sunset view from here is incredible!`,
      `${userName}, pro tip: happy hour starts in 30 minutes at the pool bar!`,
      `Between you and me, ${userName}, the chef's special tonight is amazing!`,
    ],
    achievement: [
      `${userName}, you just unlocked a new achievement! You're amazing!`,
      `Congratulations ${userName}! You're one step closer to Legend status!`,
      `${userName}, I'm so proud of you! Keep exploring with me!`,
    ],
  };

  const contextMessages = messages[context as keyof typeof messages] || messages.welcome;
  return contextMessages[Math.floor(Math.random() * contextMessages.length)];
};