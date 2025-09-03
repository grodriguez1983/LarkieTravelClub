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

export interface PreCheckInData {
  id: string;
  userId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  roomPreferences: RoomPreference[];
  estimatedArrivalTime: string;
  specialRequests: string;
  completed: boolean;
  completedAt?: Date;
}

export interface RoomPreference {
  id: string;
  type: RoomType;
  name: string;
  description: string;
  amenities: string[];
  priceRange: string;
  available: boolean;
  larkieRecommendation?: string;
}

export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Penthouse';

export interface PropertyRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'dining' | 'activities' | 'spa' | 'amenities';
  location: string;
  operatingHours: string;
  larkieNote: string;
  priority: 'high' | 'medium' | 'low';
}

// Comprehensive Pre-Check-In Types

export interface GuestPersonalData {
  id: string;
  fullName: string;
  dateOfBirth: Date;
  nationality: string;
  occupation: string;
  residentialAddress: Address;
  emergencyContact: EmergencyContact;
  travelPurpose: TravelPurpose;
  document: IdentificationDocument;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export type TravelPurpose = 'Tourism' | 'Business' | 'Medical' | 'Family Visit' | 'Education' | 'Other';

export interface IdentificationDocument {
  type: DocumentType;
  number: string;
  expirationDate: Date;
  issuingCountry: string;
  imageUrl?: string; // Mock uploaded document
  ocrData?: DocumentOCRData;
  verified: boolean;
}

export type DocumentType = 'Passport' | 'National ID' | 'Driver License' | 'Other';

export interface DocumentOCRData {
  extractedName: string;
  extractedDateOfBirth: Date;
  extractedNumber: string;
  confidence: number; // 0-1
}

export interface AdditionalGuest {
  id: string;
  personalData: GuestPersonalData;
  relationshipToMainGuest: RelationshipType;
  isMinor: boolean;
  parentalAuthorization?: ParentalAuthorization;
}

export type RelationshipType = 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Friend' | 'Colleague' | 'Other';

export interface ParentalAuthorization {
  parentName: string;
  parentDocument: string;
  authorizationDocument?: string;
  verified: boolean;
}

export interface PetRegistration {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
  weight: number;
  vetCertificates: VetCertificate[];
  insurance?: PetInsurance;
  dietaryRestrictions: string[];
  specialBehavior: string;
  petFee: number;
}

export type PetSpecies = 'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Rabbit' | 'Other';

export interface VetCertificate {
  type: CertificateType;
  issueDate: Date;
  expirationDate: Date;
  veterinarianName: string;
  imageUrl: string; // Mock uploaded certificate
  verified: boolean;
}

export type CertificateType = 'Health Certificate' | 'Vaccination Record' | 'Rabies Certificate' | 'Other';

export interface PetInsurance {
  company: string;
  policyNumber: string;
  expirationDate: Date;
  coverageAmount: number;
}

export interface VehicleInformation {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type: VehicleType;
  driverLicense: DriverLicense;
  insurance: VehicleInsurance;
  specialNeeds: VehicleSpecialNeeds[];
  parkingReservation?: ParkingReservation;
}

export type VehicleType = 'Car' | 'Motorcycle' | 'RV' | 'Truck' | 'Van' | 'Electric Car' | 'Other';

export interface DriverLicense {
  number: string;
  expirationDate: Date;
  issuingState: string;
  imageUrl?: string; // Mock uploaded license
  verified: boolean;
}

export interface VehicleInsurance {
  company: string;
  policyNumber: string;
  expirationDate: Date;
  verified: boolean;
}

export type VehicleSpecialNeeds = 'Electric Charging' | 'Large Space' | 'Covered Parking' | 'Handicap Accessible' | 'Other';

export interface ParkingReservation {
  spaceNumber: string;
  level: string;
  dailyRate: number;
  totalFee: number;
  hasElectricCharging: boolean;
}

export interface ComprehensivePreCheckInData extends PreCheckInData {
  mainGuest: GuestPersonalData;
  additionalGuests: AdditionalGuest[];
  pets: PetRegistration[];
  vehicle?: VehicleInformation;
  totalAdditionalFees: AdditionalFees;
  step: PreCheckInStep;
}

export interface AdditionalFees {
  petFees: number;
  parkingFees: number;
  other: number;
  total: number;
}

export type PreCheckInStep = 'reservation-check' | 'room-selection' | 'guest-info' | 'additional-guests' | 'pets' | 'vehicle' | 'review' | 'complete';

export interface Reservation {
  id: string;
  confirmationNumber: string;
  guestName: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomType: RoomType;
  roomNumber?: string;
  status: ReservationStatus;
  totalGuests: number;
  totalAmount: number;
  isPaid: boolean;
  createdAt: Date;
  hotelName: string;
  specialRequests?: string;
  isPreCheckedIn: boolean;
}

export type ReservationStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed' | 'No-Show';

export interface AvailableRoom extends RoomPreference {
  roomNumber: string;
  floor: number;
  view: string;
  isClean: boolean;
  lastCleaned?: Date;
}