import { User, Location, Reward, Achievement, PointTransaction, MembershipLevel, RoomPreference, PropertyRecommendation, GuestPersonalData, AdditionalGuest, PetRegistration, VehicleInformation, DocumentType, TravelPurpose, PetSpecies, VehicleType, Reservation, AvailableRoom, UserRegistrationType } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 (555) 123-4567',
  memberSince: new Date('2023-06-15'),
  membershipLevel: 'Explorer',
  pointsBalance: 1250,
  totalPointsEarned: 2840,
  registrationType: 'hotel-guest',
  hasActiveReservation: true,
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

export const mockRoomPreferences: RoomPreference[] = [
  {
    id: '1',
    type: 'Standard',
    name: 'Comfort King',
    description: 'Spacious room with city views and modern amenities',
    amenities: ['King bed', 'City view', 'Work desk', 'WiFi', 'Coffee maker'],
    priceRange: '$150-200/night',
    available: true,
    larkieRecommendation: "Perfect for first-time explorers! I love the morning light here."
  },
  {
    id: '2',
    type: 'Deluxe',
    name: 'Ocean View Deluxe',
    description: 'Premium room overlooking the beautiful coastline',
    amenities: ['King bed', 'Ocean view', 'Balcony', 'Mini bar', 'Luxury bath'],
    priceRange: '$250-300/night',
    available: true,
    larkieRecommendation: "This is where Larkie stays! The sunset views are absolutely magical from here."
  },
  {
    id: '3',
    type: 'Suite',
    name: 'Executive Suite',
    description: 'Luxurious suite with separate living area and premium amenities',
    amenities: ['King bed', 'Living room', 'Kitchenette', 'Premium minibar', 'Spa bath'],
    priceRange: '$400-500/night',
    available: true,
    larkieRecommendation: "For the true adventurers! I've heard the room service here is legendary."
  },
  {
    id: '4',
    type: 'Penthouse',
    name: 'Presidential Penthouse',
    description: 'Ultimate luxury with panoramic views and exclusive services',
    amenities: ['2 bedrooms', 'Full kitchen', 'Private terrace', 'Butler service', 'Infinity pool access'],
    priceRange: '$800-1200/night',
    available: false,
    larkieRecommendation: "The crown jewel! Even I get starstruck by this place!"
  }
];

export const mockPropertyRecommendations: PropertyRecommendation[] = [
  {
    id: '1',
    title: 'Sunset Rooftop Dining',
    description: 'Don\'t miss the golden hour at our signature rooftop restaurant',
    category: 'dining',
    location: 'Floor 25 - Rooftop',
    operatingHours: '6:00 PM - 11:00 PM',
    larkieNote: "Trust me on this one - the shrimp tacos at sunset are what dreams are made of! I've been recommending this spot to every guest.",
    priority: 'high'
  },
  {
    id: '2',
    title: 'Morning Yoga by the Pool',
    description: 'Start your day with serenity and ocean views',
    category: 'activities',
    location: 'Pool Deck Level 3',
    operatingHours: '7:00 AM - 9:00 AM (Daily)',
    larkieNote: "I love watching the sunrise yoga sessions! The instructor Maria is amazing - she even taught me a few poses!",
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Spa Signature Treatment',
    description: 'Rejuvenating ocean-inspired treatments',
    category: 'spa',
    location: 'Serenity Spa - Floor 2',
    operatingHours: '9:00 AM - 8:00 PM',
    larkieNote: "The sea salt scrub here is divine! I always recommend it after a long day of exploring the property.",
    priority: 'medium'
  },
  {
    id: '4',
    title: 'VIP Pool Cabana Access',
    description: 'Private poolside retreat with bottle service',
    category: 'amenities',
    location: 'Infinity Pool - VIP Section',
    operatingHours: '10:00 AM - 6:00 PM',
    larkieNote: "As a Larkie guest, you get priority booking! The cabanas have the best people-watching spots.",
    priority: 'high'
  }
];

export const getArrivalTimeOptions = () => [
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM', 
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM',
  '8:00 PM - 10:00 PM',
  'After 10:00 PM'
];

// Mock data for comprehensive pre-check-in

export const mockMainGuest: GuestPersonalData = {
  id: 'main-guest-1',
  fullName: 'Alex Johnson',
  dateOfBirth: new Date('1985-03-15'),
  nationality: 'United States',
  occupation: 'Software Engineer',
  residentialAddress: {
    street: '123 Tech Street, Apt 4B',
    city: 'San Francisco',
    state: 'California',
    postalCode: '94105',
    country: 'United States'
  },
  emergencyContact: {
    name: 'Sarah Johnson',
    relationship: 'Spouse',
    phoneNumber: '+1 (555) 987-6543',
    email: 'sarah.johnson@email.com'
  },
  travelPurpose: 'Tourism',
  document: {
    type: 'Passport',
    number: 'US123456789',
    expirationDate: new Date('2028-11-20'),
    issuingCountry: 'United States',
    imageUrl: 'mock://passport-image.jpg',
    ocrData: {
      extractedName: 'JOHNSON, ALEX',
      extractedDateOfBirth: new Date('1985-03-15'),
      extractedNumber: 'US123456789',
      confidence: 0.98
    },
    verified: true
  }
};

export const mockAdditionalGuests: AdditionalGuest[] = [
  {
    id: 'guest-2',
    personalData: {
      id: 'guest-2-data',
      fullName: 'Sarah Johnson',
      dateOfBirth: new Date('1987-07-22'),
      nationality: 'United States',
      occupation: 'Marketing Manager',
      residentialAddress: {
        street: '123 Tech Street, Apt 4B',
        city: 'San Francisco',
        state: 'California',
        postalCode: '94105',
        country: 'United States'
      },
      emergencyContact: {
        name: 'Robert Johnson',
        relationship: 'Father',
        phoneNumber: '+1 (555) 876-5432'
      },
      travelPurpose: 'Tourism',
      document: {
        type: 'Passport',
        number: 'US987654321',
        expirationDate: new Date('2029-05-15'),
        issuingCountry: 'United States',
        imageUrl: 'mock://passport-sarah.jpg',
        verified: true
      }
    },
    relationshipToMainGuest: 'Spouse',
    isMinor: false
  },
  {
    id: 'guest-3',
    personalData: {
      id: 'guest-3-data',
      fullName: 'Emma Johnson',
      dateOfBirth: new Date('2015-12-08'),
      nationality: 'United States',
      occupation: 'Student',
      residentialAddress: {
        street: '123 Tech Street, Apt 4B',
        city: 'San Francisco',
        state: 'California',
        postalCode: '94105',
        country: 'United States'
      },
      emergencyContact: {
        name: 'Alex Johnson',
        relationship: 'Father',
        phoneNumber: '+1 (555) 123-4567'
      },
      travelPurpose: 'Tourism',
      document: {
        type: 'Passport',
        number: 'US456789123',
        expirationDate: new Date('2030-01-10'),
        issuingCountry: 'United States',
        imageUrl: 'mock://passport-emma.jpg',
        verified: true
      }
    },
    relationshipToMainGuest: 'Child',
    isMinor: true,
    parentalAuthorization: {
      parentName: 'Alex Johnson',
      parentDocument: 'US123456789',
      authorizationDocument: 'mock://parental-auth.pdf',
      verified: true
    }
  }
];

export const mockPets: PetRegistration[] = [
  {
    id: 'pet-1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 30,
    vetCertificates: [
      {
        type: 'Health Certificate',
        issueDate: new Date('2024-06-01'),
        expirationDate: new Date('2025-06-01'),
        veterinarianName: 'Dr. Smith',
        imageUrl: 'mock://health-cert-buddy.pdf',
        verified: true
      },
      {
        type: 'Vaccination Record',
        issueDate: new Date('2024-05-15'),
        expirationDate: new Date('2025-05-15'),
        veterinarianName: 'Dr. Smith',
        imageUrl: 'mock://vaccination-buddy.pdf',
        verified: true
      }
    ],
    insurance: {
      company: 'Pet Insurance Co.',
      policyNumber: 'PIC-789456123',
      expirationDate: new Date('2025-03-15'),
      coverageAmount: 5000
    },
    dietaryRestrictions: ['No chicken', 'Grain-free'],
    specialBehavior: 'Friendly with people, may be nervous around other dogs initially',
    petFee: 75
  }
];

export const mockVehicle: VehicleInformation = {
  id: 'vehicle-1',
  make: 'Tesla',
  model: 'Model 3',
  year: 2022,
  color: 'Pearl White',
  licensePlate: 'TECH123',
  type: 'Electric Car',
  driverLicense: {
    number: 'CA-DL-123456789',
    expirationDate: new Date('2027-03-15'),
    issuingState: 'California',
    imageUrl: 'mock://drivers-license.jpg',
    verified: true
  },
  insurance: {
    company: 'State Farm',
    policyNumber: 'SF-AUTO-987654321',
    expirationDate: new Date('2025-01-15'),
    verified: true
  },
  specialNeeds: ['Electric Charging'],
  parkingReservation: {
    spaceNumber: 'EV-15',
    level: 'Level 2',
    dailyRate: 25,
    totalFee: 150, // 6 nights * $25
    hasElectricCharging: true
  }
};

export const getNationalityOptions = () => [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 
  'Australia', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands', 'Other'
];

export const getOccupationOptions = () => [
  'Software Engineer', 'Marketing Manager', 'Sales Representative', 'Teacher', 
  'Doctor', 'Lawyer', 'Consultant', 'Student', 'Retired', 'Business Owner', 
  'Designer', 'Writer', 'Other'
];

export const getTravelPurposeOptions = (): TravelPurpose[] => [
  'Tourism', 'Business', 'Medical', 'Family Visit', 'Education', 'Other'
];

export const getDocumentTypeOptions = (): DocumentType[] => [
  'Passport', 'National ID', 'Driver License', 'Other'
];

export const getRelationshipOptions = () => [
  'Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Colleague', 'Other'
];

export const getPetSpeciesOptions = (): PetSpecies[] => [
  'Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Other'
];

export const getVehicleTypeOptions = (): VehicleType[] => [
  'Car', 'Motorcycle', 'RV', 'Truck', 'Van', 'Electric Car', 'Other'
];

export const simulateDocumentOCR = (documentType: DocumentType): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        extractedName: 'JOHNSON, ALEX',
        extractedDateOfBirth: new Date('1985-03-15'),
        extractedNumber: 'US123456789',
        confidence: 0.95 + Math.random() * 0.05 // 95-100% confidence
      });
    }, 2000); // Simulate 2 second processing time
  });
};

export const calculatePreCheckInFees = (pets: PetRegistration[], vehicle?: VehicleInformation) => {
  const petFees = pets.reduce((total, pet) => total + pet.petFee, 0);
  const parkingFees = vehicle?.parkingReservation?.totalFee || 0;
  const other = 0;
  
  return {
    petFees,
    parkingFees,
    other,
    total: petFees + parkingFees + other
  };
};

// Mock reservations data
export const mockUserReservations: Reservation[] = [
  {
    id: 'res-1',
    confirmationNumber: 'LTC-2024-001234',
    guestName: 'Alex Johnson',
    checkInDate: new Date('2024-12-15'),
    checkOutDate: new Date('2024-12-22'),
    roomType: 'Deluxe',
    roomNumber: '1205',
    status: 'Confirmed',
    totalGuests: 3,
    totalAmount: 1890.00,
    isPaid: true,
    createdAt: new Date('2024-11-20'),
    hotelName: 'Larkie\'s Paradise Resort',
    specialRequests: 'Ocean view room, late checkout if possible',
    isPreCheckedIn: false
  },
  {
    id: 'res-2',
    confirmationNumber: 'LTC-2025-000567',
    guestName: 'Alex Johnson',
    checkInDate: new Date('2025-02-14'),
    checkOutDate: new Date('2025-02-18'),
    roomType: 'Suite',
    status: 'Confirmed',
    totalGuests: 2,
    totalAmount: 1600.00,
    isPaid: true,
    createdAt: new Date('2024-12-01'),
    hotelName: 'Larkie\'s Mountain Lodge',
    specialRequests: 'Romantic setup for Valentine\'s Day',
    isPreCheckedIn: false
  }
];

export const mockAvailableRooms: AvailableRoom[] = [
  {
    id: '1',
    type: 'Standard',
    name: 'Comfort King',
    description: 'Spacious room with city views and modern amenities',
    amenities: ['King bed', 'City view', 'Work desk', 'WiFi', 'Coffee maker'],
    priceRange: '$150-200/night',
    available: true,
    larkieRecommendation: "Perfect for first-time explorers! I love the morning light here.",
    roomNumber: '803',
    floor: 8,
    view: 'City View',
    isClean: true,
    lastCleaned: new Date('2024-12-10T14:00:00')
  },
  {
    id: '2',
    type: 'Deluxe',
    name: 'Ocean View Deluxe',
    description: 'Premium room overlooking the beautiful coastline',
    amenities: ['King bed', 'Ocean view', 'Balcony', 'Mini bar', 'Luxury bath'],
    priceRange: '$250-300/night',
    available: true,
    larkieRecommendation: "This is where Larkie stays! The sunset views are absolutely magical from here.",
    roomNumber: '1205',
    floor: 12,
    view: 'Ocean View',
    isClean: true,
    lastCleaned: new Date('2024-12-10T16:30:00')
  },
  {
    id: '3',
    type: 'Suite',
    name: 'Executive Suite',
    description: 'Luxurious suite with separate living area and premium amenities',
    amenities: ['King bed', 'Living room', 'Kitchenette', 'Premium minibar', 'Spa bath'],
    priceRange: '$400-500/night',
    available: true,
    larkieRecommendation: "For the true adventurers! I've heard the room service here is legendary.",
    roomNumber: '1501',
    floor: 15,
    view: 'Panoramic Ocean & City View',
    isClean: true,
    lastCleaned: new Date('2024-12-10T10:00:00')
  },
  {
    id: '4',
    type: 'Penthouse',
    name: 'Presidential Penthouse',
    description: 'Ultimate luxury with panoramic views and exclusive services',
    amenities: ['2 bedrooms', 'Full kitchen', 'Private terrace', 'Butler service', 'Infinity pool access'],
    priceRange: '$800-1200/night',
    available: false,
    larkieRecommendation: "The crown jewel! Even I get starstruck by this place!",
    roomNumber: '2001',
    floor: 20,
    view: '360° Panoramic View',
    isClean: false,
    lastCleaned: new Date('2024-12-09T12:00:00')
  }
];

export const searchReservationByConfirmation = async (confirmationNumber: string): Promise<Reservation | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reservation = mockUserReservations.find(
        res => res.confirmationNumber.toLowerCase().includes(confirmationNumber.toLowerCase())
      );
      resolve(reservation || null);
    }, 1000); // Simulate API call delay
  });
};

export const searchReservationByNameAndDate = async (name: string, checkInDate: Date): Promise<Reservation[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reservations = mockUserReservations.filter(
        res => 
          res.guestName.toLowerCase().includes(name.toLowerCase()) &&
          res.checkInDate.toDateString() === checkInDate.toDateString()
      );
      resolve(reservations);
    }, 1000);
  });
};

export const getAvailableRoomsForDates = async (checkInDate: Date, checkOutDate: Date, guests: number): Promise<AvailableRoom[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter rooms based on availability and capacity
      const availableRooms = mockAvailableRooms.filter(room => {
        const maxCapacity = room.type === 'Standard' ? 2 : 
                          room.type === 'Deluxe' ? 3 : 
                          room.type === 'Suite' ? 4 : 6;
        return room.available && room.isClean && guests <= maxCapacity;
      });
      resolve(availableRooms);
    }, 1500);
  });
};