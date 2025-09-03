import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LarkieCharacter } from '../../components/LarkieCharacter';
import { Colors, gradients } from '../../constants/colors';
import { NavigationProps, Location } from '../../types';
import { StorageService } from '../../services/storage';
import { mockLocations, mockUser, getLarkieMessages } from '../../services/mockData';

const { width, height } = Dimensions.get('window');

interface ScanResult {
  location: Location;
  pointsEarned: number;
  isFirstVisit: boolean;
}

export const ScannerScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  const scanAnimation = new Animated.Value(0);
  const resultAnimation = new Animated.Value(0);

  useEffect(() => {
    getCameraPermissions();
    startScanAnimation();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    processQRCode(data);
  };

  const processQRCode = async (qrCode: string) => {
    // Find matching location
    const location = mockLocations.find(loc => loc.qrCode === qrCode);
    
    if (!location) {
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not recognized. Please try scanning a valid Larkie QR code.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    // Check if already discovered
    const discoveredLocations = await StorageService.getDiscoveredLocations();
    const isFirstVisit = !discoveredLocations.find(loc => loc.id === location.id);
    const pointsEarned = isFirstVisit ? location.pointValue : Math.floor(location.pointValue * 0.3); // 30% for repeat visits

    // Update storage
    if (isFirstVisit) {
      await StorageService.saveDiscoveredLocation(location);
    }

    // Add points transaction
    await StorageService.addPointTransaction({
      id: Date.now().toString(),
      type: 'earned',
      amount: pointsEarned,
      description: `QR code scanned at ${location.name}`,
      location: location.name,
      timestamp: new Date(),
    });

    // Update user points
    const user = await StorageService.getUser();
    if (user) {
      await StorageService.updateUserPoints(
        user.pointsBalance + pointsEarned,
        user.totalPointsEarned + pointsEarned
      );
    }

    setScanResult({
      location,
      pointsEarned,
      isFirstVisit,
    });

    // Animate result modal
    setShowResult(true);
    Animated.spring(resultAnimation, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const closeScanResult = () => {
    Animated.timing(resultAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowResult(false);
      setScanned(false);
      setScanResult(null);
    });
  };

  const continueScanningOrNavigate = (action: string) => {
    closeScanResult();
    
    if (action === 'map') {
      navigation.navigate('Map');
    } else if (action === 'home') {
      navigation.navigate('Home');
    }
    // If action is 'continue', just close modal and continue scanning
  };

  const getLarkieMessageForLocation = (location: Location, isFirstVisit: boolean) => {
    const userName = mockUser.name.split(' ')[0];
    
    if (location.category === 'Pool') {
      return `${userName}, the water's amazing right now!`;
    } else if (location.category === 'Restaurant' || location.category === 'Bar') {
      return location.tips[0] || `${userName}, try the spicy margarita!`;
    } else if (location.category === 'Lobby') {
      return `Welcome ${userName}! Check out the rooftop at sunset!`;
    } else if (isFirstVisit) {
      return `Great discovery, ${userName}! You're becoming quite the explorer!`;
    } else {
      return `Welcome back, ${userName}! Still love this place!`;
    }
  };

  const getLarkieContextForLocation = (location: Location) => {
    if (location.category === 'Pool') return 'pool';
    if (location.category === 'Restaurant' || location.category === 'Bar') return 'food';
    if (location.category === 'Spa') return 'formal';
    return 'exploration';
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off" size={64} color={Colors.neutral.gray} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Please enable camera access in your device settings to scan QR codes.
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417'],
        }}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={28} color={Colors.neutral.white} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.flashButton}
              onPress={() => setFlashOn(!flashOn)}
            >
              <Ionicons 
                name={flashOn ? "flash" : "flash-off"} 
                size={24} 
                color={Colors.neutral.white} 
              />
            </TouchableOpacity>
          </View>

          {/* Scanning Frame */}
          <View style={styles.scanningArea}>
            <View style={styles.scanFrame}>
              {/* Corner brackets */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scanning line animation */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-100, 100],
                        }),
                      },
                    ],
                    opacity: scanAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 1, 0.3],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <LarkieCharacter
              context="exploration"
              message="Point your camera at a Larkie QR code!"
              userName="Explorer"
              size="small"
              showSpeechBubble={true}
            />
            
            <Text style={styles.instructionText}>
              Point your camera at a Larkie QR code
            </Text>
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.manualInputButton}
              onPress={() => setShowManualInput(true)}
            >
              <Ionicons name="keypad" size={20} color={Colors.neutral.white} />
              <Text style={styles.manualInputText}>Enter code manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Scan Result Modal */}
      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.resultModal,
              {
                opacity: resultAnimation,
                transform: [
                  {
                    scale: resultAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={gradients.success}
              style={styles.resultHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark-circle" size={48} color={Colors.neutral.white} />
              <Text style={styles.resultTitle}>
                {scanResult?.isFirstVisit ? 'Location Discovered!' : 'Welcome Back!'}
              </Text>
              <Text style={styles.resultSubtitle}>
                {scanResult?.location.name}
              </Text>
            </LinearGradient>

            <View style={styles.resultContent}>
              <View style={styles.pointsEarned}>
                <Text style={styles.pointsText}>+{scanResult?.pointsEarned} Points</Text>
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: resultAnimation.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1.2, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons name="diamond" size={24} color={Colors.accent.goldRewards} />
                </Animated.View>
              </View>

              {scanResult && (
                <View style={styles.larkieResponse}>
                  <LarkieCharacter
                    context={getLarkieContextForLocation(scanResult.location)}
                    message={getLarkieMessageForLocation(scanResult.location, scanResult.isFirstVisit)}
                    userName={mockUser.name.split(' ')[0]}
                    size="medium"
                    showSpeechBubble={true}
                  />
                </View>
              )}

              <View style={styles.locationDetails}>
                <Text style={styles.locationName}>{scanResult?.location.name}</Text>
                <Text style={styles.locationDescription}>
                  {scanResult?.location.description}
                </Text>
                
                {scanResult?.location.operatingHours && (
                  <View style={styles.locationInfo}>
                    <Ionicons name="time" size={16} color={Colors.neutral.gray} />
                    <Text style={styles.locationInfoText}>
                      {scanResult.location.operatingHours}
                    </Text>
                  </View>
                )}
                
                {scanResult?.location.specialOffer && (
                  <View style={styles.specialOffer}>
                    <Ionicons name="star" size={16} color={Colors.accent.goldRewards} />
                    <Text style={styles.specialOfferText}>
                      {scanResult.location.specialOffer}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={[styles.resultButton, styles.resultButtonSecondary]}
                  onPress={() => continueScanningOrNavigate('map')}
                >
                  <Ionicons name="map" size={18} color={Colors.primary.larkieBlue} />
                  <Text style={styles.resultButtonSecondaryText}>View on Map</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resultButton, styles.resultButtonPrimary]}
                  onPress={() => continueScanningOrNavigate('continue')}
                >
                  <Text style={styles.resultButtonPrimaryText}>Keep Exploring</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.neutral.white} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.neutral.white,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.deepNavy,
    marginVertical: 15,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Colors.neutral.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: Colors.primary.larkieBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 10,
  },
  flashButton: {
    padding: 10,
  },
  scanningArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary.larkieBlue,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary.larkieBlue,
    top: '50%',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  instructionText: {
    color: Colors.neutral.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  manualInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.neutral.white,
  },
  manualInputText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModal: {
    width: width - 40,
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    marginTop: 15,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 18,
    color: Colors.neutral.white,
    marginTop: 5,
    textAlign: 'center',
    opacity: 0.9,
  },
  resultContent: {
    padding: 20,
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.accent.successGreen,
    marginRight: 8,
  },
  larkieResponse: {
    alignItems: 'center',
    marginBottom: 20,
  },
  locationDetails: {
    marginBottom: 25,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.deepNavy,
    marginBottom: 8,
  },
  locationDescription: {
    fontSize: 14,
    color: Colors.neutral.gray,
    lineHeight: 20,
    marginBottom: 15,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationInfoText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginLeft: 8,
  },
  specialOffer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightGray,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.goldRewards,
  },
  specialOfferText: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  resultButtonPrimary: {
    backgroundColor: Colors.primary.larkieBlue,
  },
  resultButtonSecondary: {
    backgroundColor: Colors.neutral.lightGray,
    borderWidth: 1,
    borderColor: Colors.primary.larkieBlue,
  },
  resultButtonPrimaryText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  resultButtonSecondaryText: {
    color: Colors.primary.larkieBlue,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});