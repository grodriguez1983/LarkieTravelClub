import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Images, getLarkieImageForContext } from '../constants/images';
import { LarkieImage } from '../types';

interface LarkieCharacterProps {
  context?: string;
  membershipLevel?: string;
  message?: string;
  userName?: string;
  size?: 'small' | 'medium' | 'large';
  showSpeechBubble?: boolean;
  onPress?: () => void;
  customImage?: LarkieImage;
}

export const LarkieCharacter: React.FC<LarkieCharacterProps> = ({
  context = 'default',
  membershipLevel,
  message,
  userName = 'Friend',
  size = 'medium',
  showSpeechBubble = false,
  onPress,
  customImage,
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce animation on mount
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounceAnim, fadeAnim]);

  const getImageSource = () => {
    if (customImage) {
      return Images.larkie[customImage.replace('larkie-', '') as keyof typeof Images.larkie];
    }
    return getLarkieImageForContext(context, membershipLevel);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60 };
      case 'large':
        return { width: 120, height: 120 };
      default:
        return { width: 80, height: 80 };
    }
  };

  const renderSpeechBubble = () => {
    if (!showSpeechBubble || !message) return null;

    return (
      <View style={styles.speechBubble}>
        <Text style={styles.speechText}>{message}</Text>
        <View style={styles.speechTail} />
      </View>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: bounceAnim }],
        },
      ]}
    >
      {renderSpeechBubble()}
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        style={[styles.imageContainer, getSizeStyles()]}
      >
        <Animated.Image
          source={getImageSource()}
          style={[styles.image, getSizeStyles()]}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    borderRadius: 50,
    backgroundColor: 'transparent',
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    borderRadius: 50,
  },
  speechBubble: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    maxWidth: 200,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: Colors.primary.larkieBlue,
  },
  speechText: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
  speechTail: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.neutral.white,
  },
});