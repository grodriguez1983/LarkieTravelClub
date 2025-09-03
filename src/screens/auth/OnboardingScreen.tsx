import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LarkieCharacter } from '../../components/LarkieCharacter';
import { Colors, gradients } from '../../constants/colors';
import { NavigationProps } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  larkieImage: 'explorer' | 'cocktail' | 'base';
  larkieMessage: string;
  context: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Discover & Earn Points',
    description: 'Scan QR codes around the hotel to discover amazing locations and earn points for every visit!',
    larkieImage: 'explorer',
    larkieMessage: "Hey there! I'm Larkie, ready for an adventure?",
    context: 'exploration',
  },
  {
    id: 2,
    title: 'Redeem Amazing Rewards',
    description: 'Trade your hard-earned points for cocktails, room upgrades, spa treatments, and exclusive merchandise!',
    larkieImage: 'cocktail',
    larkieMessage: 'My top tip? Trade those points for a margarita!',
    context: 'food',
  },
  {
    id: 3,
    title: 'Watch Me Grow With You',
    description: 'As you explore and earn points, I evolve too! Rise through membership levels and unlock exclusive benefits.',
    larkieImage: 'base',
    larkieMessage: "Let's start this journey together!",
    context: 'default',
  },
];

export const OnboardingScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        scrollX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50 && currentSlide > 0) {
          // Swipe right - previous slide
          goToPreviousSlide();
        } else if (gestureState.dx < -50 && currentSlide < slides.length - 1) {
          // Swipe left - next slide
          goToNextSlide();
        } else {
          // Snap back
          Animated.spring(scrollX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      animateSlideTransition();
    } else {
      navigation.navigate('Registration');
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      animateSlideTransition();
    }
  };

  const animateSlideTransition = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.spring(scrollX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const skipTutorial = () => {
    navigation.navigate('Registration');
  };

  const renderProgressDots = () => {
    return (
      <View style={styles.progressContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentSlide ? styles.progressDotActive : {},
            ]}
          />
        ))}
      </View>
    );
  };

  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.deepNavy} />
      
      <LinearGradient
        colors={gradients.larkie}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={skipTutorial} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Animated.View 
          style={[
            styles.content,
            {
              transform: [
                { translateX: scrollX },
                { 
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.95],
                  })
                }
              ],
              opacity: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.3],
              }),
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.larkieContainer}>
            <LarkieCharacter
              context={currentSlideData.context}
              message={currentSlideData.larkieMessage}
              userName="Friend"
              size="large"
              showSpeechBubble={true}
              customImage={`larkie-${currentSlideData.larkieImage}` as any}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentSlideData.title}</Text>
            <Text style={styles.description}>{currentSlideData.description}</Text>
          </View>

          {currentSlide === 0 && (
            <View style={styles.mockQRContainer}>
              <View style={styles.mockQR}>
                <Ionicons name="qr-code" size={60} color={Colors.primary.deepNavy} />
              </View>
              <Text style={styles.mockQRText}>Scan me!</Text>
            </View>
          )}

          {currentSlide === 1 && (
            <View style={styles.rewardGrid}>
              <View style={styles.rewardItem}>
                <Ionicons name="wine" size={30} color={Colors.accent.goldRewards} />
                <Text style={styles.rewardText}>Cocktails</Text>
              </View>
              <View style={styles.rewardItem}>
                <Ionicons name="bed" size={30} color={Colors.accent.goldRewards} />
                <Text style={styles.rewardText}>Upgrades</Text>
              </View>
              <View style={styles.rewardItem}>
                <Ionicons name="gift" size={30} color={Colors.accent.goldRewards} />
                <Text style={styles.rewardText}>Merch</Text>
              </View>
              <View style={styles.rewardItem}>
                <Ionicons name="flower" size={30} color={Colors.accent.goldRewards} />
                <Text style={styles.rewardText}>Spa</Text>
              </View>
            </View>
          )}

          {currentSlide === 2 && (
            <View style={styles.evolutionContainer}>
              <View style={styles.evolutionRow}>
                <View style={styles.membershipLevel}>
                  <Text style={[styles.levelText, { color: Colors.membership.explorer }]}>Explorer</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={Colors.neutral.white} />
                <View style={styles.membershipLevel}>
                  <Text style={[styles.levelText, { color: Colors.membership.legend }]}>Legend</Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        <View style={styles.bottom}>
          {renderProgressDots()}
          
          <View style={styles.buttonContainer}>
            {currentSlide > 0 && (
              <TouchableOpacity onPress={goToPreviousSlide} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={Colors.neutral.white} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={goToNextSlide} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1 ? "Start My Journey" : "Next"}
              </Text>
              {currentSlide < slides.length - 1 && (
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  larkieContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: Colors.primary.deepNavy,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 16,
    color: Colors.neutral.white,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  mockQRContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  mockQR: {
    backgroundColor: Colors.neutral.white,
    padding: 20,
    borderRadius: 12,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  mockQRText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  rewardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  rewardItem: {
    alignItems: 'center',
    margin: 10,
    backgroundColor: Colors.neutral.white,
    padding: 15,
    borderRadius: 12,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rewardText: {
    color: Colors.primary.deepNavy,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  evolutionContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  evolutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    padding: 20,
    borderRadius: 12,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  membershipLevel: {
    marginHorizontal: 15,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.white,
    opacity: 0.3,
    marginHorizontal: 4,
  },
  progressDotActive: {
    opacity: 1,
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 12,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  nextButtonText: {
    color: Colors.primary.deepNavy,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
});