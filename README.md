# Larkie's Travel Club - Phase 1 MVP

A complete React Native mobile app for "Larkie's Travel Club" - a gamified hotel loyalty program featuring the adorable bird mascot Larkie.

## Features

### 🎯 Core Functionality
- **QR Code Scanning**: Discover hotel locations by scanning QR codes
- **Points System**: Earn points for discoveries and redeem for rewards
- **Interactive Hotel Map**: Explore and track discovered locations
- **Rewards Catalog**: Browse and redeem various rewards using points
- **User Profile**: Track progress, achievements, and membership evolution

### 🐦 Larkie Integration
- **Contextual Appearance**: Larkie changes based on location and membership level
- **Personalized Messages**: Dynamic speech bubbles with user's name
- **Evolution System**: Larkie evolves as user progresses through membership levels
- **Personality**: Playful, witty, and knowledgeable companion

### 📱 User Experience
- **Smooth Onboarding**: 3-step tutorial introducing core features
- **Registration Flow**: Email/phone verification with OTP
- **Responsive Design**: Native mobile feel with smooth animations
- **Offline Support**: Basic functionality works without internet
- **Data Persistence**: AsyncStorage for user progress and preferences

## Tech Stack

- **React Native** with **TypeScript**
- **Expo** for development and build tooling
- **React Navigation** for navigation
- **Expo Camera** for QR code scanning
- **AsyncStorage** for data persistence
- **Expo Linear Gradient** for beautiful UI effects
- **Vector Icons** for consistent iconography

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator

### Installation
1. Clone the repository
2. Navigate to project directory: `cd LarkieTravelClub`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Use Expo Go app to scan QR code or press 'i' for iOS simulator

### Demo QR Codes
The app includes mock data with several QR codes you can test:
- `POOL_BAR_001` - Pool Bar (75 points)
- `ROOFTOP_REST_001` - Rooftop Restaurant (100 points)
- `SPA_RELAX_001` - Spa Relaxation Area (50 points)
- `SECRET_GARDEN_001` - Secret Garden Lounge (150 points)
- `MAIN_LOBBY_001` - Main Lobby (25 points)
- `FITNESS_CENTER_001` - Fitness Center (40 points)

## App Structure

### Navigation Flow
```
App Launch → Splash → Onboarding → Registration → OTP → Welcome → Main App
                                                                    ↓
                                            Bottom Tab Navigation:
                                            - Home Dashboard
                                            - Hotel Map
                                            - QR Scanner (Center)
                                            - Rewards
                                            - User Profile
```

### Key Screens

#### Authentication Flow
- **Splash Screen**: Logo animation with loading
- **Onboarding**: 3-screen tutorial with Larkie interactions
- **Registration**: User signup with form validation
- **OTP Verification**: Phone number verification
- **Welcome Success**: Data import animation

#### Main Application
- **Home Dashboard**: Points balance, quick actions, recent activity
- **QR Scanner**: Full-screen camera with scanning interface
- **Hotel Map**: Interactive property map with location markers
- **Rewards Screen**: Available rewards and points history
- **Profile Screen**: User info, achievements, settings

### Larkie Image Assets
The app uses 7 different Larkie images for various contexts:
- `larkie-base.png` - Default/morning appearance
- `larkie-vacation.png` - Pool/casual areas
- `larkie-cocktail.png` - Restaurants/bars
- `larkie-formal.png` - VIP/evening contexts
- `larkie-explorer.png` - Discovery/adventure
- `larkie-logo.png` - App branding
- `larkie-foodie-badge.png` - Achievement contexts

## Membership Levels & Progression

### Level System
1. **Explorer** (0-499 points) - Blue Larkie with basic benefits
2. **Adventurer** (500-1499 points) - Vacation Larkie with enhanced benefits  
3. **Pioneer** (1500-2999 points) - Cocktail Larkie with premium benefits
4. **Legend** (3000+ points) - Formal Larkie with VIP benefits

### Benefits Include
- Progressive discounts on food & drinks (5% → 20%)
- Late checkout extensions
- Room upgrade priorities
- Exclusive access to VIP areas and events

## Demo Data

The app includes comprehensive mock data:
- Sample user profile with existing points and history
- 6 hotel locations with different categories and point values
- 5+ rewards across multiple categories
- Achievement system with earned and unearned badges
- Realistic point transaction history

## Development Notes

### Key Components
- `LarkieCharacter`: Reusable mascot component with contextual appearance
- `AppNavigator`: Main navigation structure
- `StorageService`: AsyncStorage wrapper for data persistence
- Mock data services for realistic demo experience

### Brand Colors
- Deep Navy: `#1B365D` (headers, main elements)
- Steel Blue: `#4A90A4` (secondary elements)  
- Larkie Blue: `#5DADE2` (mascot, primary actions)
- Success Green: `#58D68D` (points earned, achievements)
- Gold Rewards: `#F1C40F` (rewards, premium elements)

### Performance Features
- Optimized image loading and caching
- Smooth 60fps animations throughout
- Efficient state management
- Background processing for data operations

## Future Enhancements (Post-MVP)

- Real backend integration with hotel PMS
- Push notifications for special offers
- Social features and sharing
- Advanced analytics and personalization
- Multi-language support
- Apple Wallet / Google Pay integration

## License

This project is a demo application created for Larkie's Travel Club MVP presentation.

---

Built with ❤️ and lots of ☕ for the ultimate hotel loyalty experience! 🏨✨