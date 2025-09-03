import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LarkieCharacter } from '../../components/LarkieCharacter';
import { Colors, gradients } from '../../constants/colors';
import { NavigationProps, User, Achievement, MembershipLevel } from '../../types';
import { StorageService } from '../../services/storage';
import { mockUser, mockAchievements, getMembershipLevelInfo } from '../../services/mockData';

const { width } = Dimensions.get('window');

interface AppSettings {
  notificationsEnabled: boolean;
  larkieMessageFrequency: 'low' | 'normal' | 'high';
  soundEnabled: boolean;
}

export const ProfileScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [user, setUser] = useState<User>(mockUser);
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    notificationsEnabled: true,
    larkieMessageFrequency: 'normal',
    soundEnabled: true,
  });
  const [showLarkieEvolution, setShowLarkieEvolution] = useState(false);

  useEffect(() => {
    loadUserData();
    loadSettings();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUser();
      if (userData) {
        setUser(userData);
      }
      
      // Load achievements (would come from storage in real app)
      // For demo, using mock data with some earned
      const userAchievements = mockAchievements.map(achievement => ({
        ...achievement,
        earned: achievement.id === '1' || achievement.id === '2' ? true : false,
        earnedAt: achievement.id === '1' || achievement.id === '2' ? new Date() : undefined,
      }));
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await StorageService.getAppSettings();
      setAppSettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      const newSettings = { ...appSettings, [key]: value };
      setAppSettings(newSettings);
      await StorageService.saveAppSettings(newSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const membershipInfo = getMembershipLevelInfo(user.membershipLevel);
  const progressToNext = membershipInfo.nextLevel ? 
    Math.min((user.totalPointsEarned / membershipInfo.pointsRequired) * 100, 100) : 100;

  const earnedAchievements = achievements.filter(achievement => achievement.earned);
  const totalAchievements = achievements.length;

  const getLarkieImageForLevel = (level: MembershipLevel) => {
    switch (level) {
      case 'Explorer':
        return 'larkie-explorer';
      case 'Adventurer':
        return 'larkie-vacation';
      case 'Pioneer':
        return 'larkie-cocktail';
      case 'Legend':
        return 'larkie-formal';
      default:
        return 'larkie-base';
    }
  };

  const getNextLarkieImage = () => {
    if (!membershipInfo.nextLevel) return 'larkie-formal';
    return getLarkieImageForLevel(membershipInfo.nextLevel as MembershipLevel);
  };

  const handleEditProfile = () => {
    // In a real app, this would navigate to an edit profile screen
    Alert.alert(
      'Edit Profile',
      'Profile editing feature would be implemented here.',
      [{ text: 'OK' }]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              // In a real app, this would reset navigation to auth flow
              Alert.alert('Signed Out', 'You have been signed out successfully.');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  const formatMemberSince = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getAchievementIcon = (achievement: Achievement) => {
    return achievement.icon as keyof typeof Ionicons.glyphMap;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.deepNavy} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={gradients.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={Colors.neutral.white} />
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color={Colors.neutral.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.memberSince}>
                Member since {formatMemberSince(user.memberSince)}
              </Text>
              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                <Ionicons name="create" size={16} color={Colors.primary.larkieBlue} />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Larkie Companion Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Larkie</Text>
            <View style={styles.larkieSection}>
              <TouchableOpacity 
                style={styles.currentLarkie}
                onPress={() => setShowLarkieEvolution(true)}
              >
                <LarkieCharacter
                  context="default"
                  customImage={getLarkieImageForLevel(user.membershipLevel) as any}
                  size="large"
                />
                <Text style={styles.larkieLabel}>{user.membershipLevel} Larkie</Text>
                <Text style={styles.larkieTapHint}>Tap to see evolution story</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Membership Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Membership Progress</Text>
            <View style={styles.membershipCard}>
              <View style={styles.membershipHeader}>
                <Text style={[styles.membershipLevel, { color: membershipInfo.color }]}>
                  {user.membershipLevel}
                </Text>
                <Text style={styles.totalPoints}>
                  {user.totalPointsEarned.toLocaleString()} total points
                </Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { 
                        width: `${progressToNext}%`,
                        backgroundColor: membershipInfo.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {membershipInfo.nextLevel ? (
                    `${membershipInfo.pointsRequired - user.totalPointsEarned} points to ${membershipInfo.nextLevel}`
                  ) : (
                    'Maximum level achieved!'
                  )}
                </Text>
              </View>

              <View style={styles.benefitsList}>
                <Text style={styles.benefitsTitle}>Current Benefits</Text>
                {membershipInfo.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color={membershipInfo.color} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              {membershipInfo.nextLevel && (
                <TouchableOpacity 
                  style={styles.nextLevelPreview}
                  onPress={() => setShowLarkieEvolution(true)}
                >
                  <Text style={styles.nextLevelText}>
                    Preview {membershipInfo.nextLevel} Larkie
                  </Text>
                  <LarkieCharacter
                    context="formal"
                    customImage={getNextLarkieImage() as any}
                    size="small"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Travel Story */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Journey with Larkie</Text>
            <View style={styles.travelStoryCard}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>2</Text>
                  <Text style={styles.statLabel}>Hotel Stays</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user.totalPointsEarned.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Points Earned</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>3</Text>
                  <Text style={styles.statLabel}>Rewards Redeemed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{earnedAchievements.length}</Text>
                  <Text style={styles.statLabel}>Achievements</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Badges Collection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badge Collection</Text>
            <View style={styles.badgesGrid}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.badgeItem,
                    !achievement.earned ? styles.badgeItemDisabled : {},
                  ]}
                >
                  <View style={[
                    styles.badgeIcon,
                    { backgroundColor: achievement.earned ? membershipInfo.color : Colors.neutral.gray },
                  ]}>
                    <Ionicons
                      name={getAchievementIcon(achievement)}
                      size={24}
                      color={Colors.neutral.white}
                    />
                  </View>
                  <Text style={[
                    styles.badgeName,
                    !achievement.earned ? styles.badgeTextDisabled : {},
                  ]}>
                    {achievement.name}
                  </Text>
                  {achievement.earned ? (
                    <Text style={styles.badgeEarnedDate}>
                      {achievement.earnedAt?.toLocaleDateString()}
                    </Text>
                  ) : (
                    <Text style={styles.badgeRequirement}>
                      {achievement.requirements}
                    </Text>
                  )}
                </View>
              ))}
            </View>
            <Text style={styles.badgeProgress}>
              {earnedAchievements.length} of {totalAchievements} badges earned
            </Text>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications" size={20} color={Colors.primary.larkieBlue} />
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                </View>
                <Switch
                  value={appSettings.notificationsEnabled}
                  onValueChange={(value) => updateSetting('notificationsEnabled', value)}
                  trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.larkieBlue }}
                  thumbColor={Colors.neutral.white}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="volume-high" size={20} color={Colors.primary.larkieBlue} />
                  <Text style={styles.settingLabel}>Sound Effects</Text>
                </View>
                <Switch
                  value={appSettings.soundEnabled}
                  onValueChange={(value) => updateSetting('soundEnabled', value)}
                  trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.larkieBlue }}
                  thumbColor={Colors.neutral.white}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="chatbubble" size={20} color={Colors.primary.larkieBlue} />
                  <Text style={styles.settingLabel}>Larkie Message Frequency</Text>
                </View>
                <TouchableOpacity style={styles.frequencyButton}>
                  <Text style={styles.frequencyButtonText}>
                    {appSettings.larkieMessageFrequency ? 
                      appSettings.larkieMessageFrequency.charAt(0).toUpperCase() + appSettings.larkieMessageFrequency.slice(1) : 
                      'Normal'
                    }
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.neutral.gray} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="help-circle" size={20} color={Colors.primary.larkieBlue} />
                  <Text style={styles.settingLabel}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.neutral.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="information-circle" size={20} color={Colors.primary.larkieBlue} />
                  <Text style={styles.settingLabel}>About</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.neutral.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
                <View style={styles.settingLeft}>
                  <Ionicons name="log-out" size={20} color="#E74C3C" />
                  <Text style={[styles.settingLabel, { color: '#E74C3C' }]}>Sign Out</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* Larkie Evolution Modal */}
      <Modal visible={showLarkieEvolution} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.evolutionModal}>
            <LinearGradient
              colors={gradients.larkie}
              style={styles.evolutionHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowLarkieEvolution(false)}
              >
                <Ionicons name="close" size={24} color={Colors.neutral.white} />
              </TouchableOpacity>
              <Text style={styles.evolutionTitle}>Larkie's Evolution Journey</Text>
            </LinearGradient>

            <ScrollView style={styles.evolutionContent}>
              <View style={styles.currentEvolution}>
                <Text style={styles.evolutionSubtitle}>Current Larkie</Text>
                <LarkieCharacter
                  context="default"
                  customImage={getLarkieImageForLevel(user.membershipLevel) as any}
                  size="large"
                  message={`I'm your ${user.membershipLevel} companion, ${user.name.split(' ')[0]}!`}
                  userName={user.name.split(' ')[0]}
                  showSpeechBubble={true}
                />
                <Text style={styles.evolutionLevelName}>{user.membershipLevel} Larkie</Text>
                <Text style={styles.evolutionDescription}>
                  As a {user.membershipLevel}, I'm here to guide you on your hotel adventures and help you discover amazing places!
                </Text>
              </View>

              {membershipInfo.nextLevel && (
                <View style={styles.nextEvolution}>
                  <Text style={styles.evolutionSubtitle}>Next Evolution</Text>
                  <LarkieCharacter
                    context="formal"
                    customImage={getNextLarkieImage() as any}
                    size="large"
                    message={`Unlock me at ${membershipInfo.pointsRequired} points!`}
                    userName={user.name.split(' ')[0]}
                    showSpeechBubble={true}
                  />
                  <Text style={styles.evolutionLevelName}>{membershipInfo.nextLevel} Larkie</Text>
                  <Text style={styles.evolutionDescription}>
                    Reach {membershipInfo.nextLevel} status to unlock my new look and exclusive benefits!
                  </Text>
                  
                  <View style={styles.evolutionProgress}>
                    <Text style={styles.evolutionProgressText}>
                      {membershipInfo.pointsRequired - user.totalPointsEarned} more points needed
                    </Text>
                    <View style={styles.evolutionProgressBar}>
                      <View
                        style={[
                          styles.evolutionProgressFill,
                          { width: `${progressToNext}%` }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.steelBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.neutral.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary.larkieBlue,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: Colors.neutral.white,
    opacity: 0.8,
    marginBottom: 10,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    color: Colors.primary.larkieBlue,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.deepNavy,
    marginBottom: 15,
  },
  larkieSection: {
    alignItems: 'center',
  },
  currentLarkie: {
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  larkieLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.deepNavy,
    marginTop: 10,
  },
  larkieTapHint: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginTop: 5,
  },
  membershipCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  membershipLevel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPoints: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: 'center',
  },
  benefitsList: {
    marginBottom: 15,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.deepNavy,
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginLeft: 8,
    flex: 1,
  },
  nextLevelPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  nextLevelText: {
    fontSize: 14,
    color: Colors.primary.larkieBlue,
    fontWeight: '600',
  },
  travelStoryCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.larkieBlue,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: (width - 60) / 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeItemDisabled: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.deepNavy,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeTextDisabled: {
    color: Colors.neutral.gray,
  },
  badgeEarnedDate: {
    fontSize: 10,
    color: Colors.accent.successGreen,
    textAlign: 'center',
  },
  badgeRequirement: {
    fontSize: 10,
    color: Colors.neutral.gray,
    textAlign: 'center',
    lineHeight: 12,
  },
  badgeProgress: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: 'center',
    marginTop: 10,
  },
  settingsCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    paddingVertical: 10,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    marginLeft: 12,
  },
  frequencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  frequencyButtonText: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
    marginRight: 6,
  },
  versionText: {
    fontSize: 12,
    color: Colors.neutral.gray,
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  evolutionModal: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  evolutionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 5,
  },
  evolutionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    textAlign: 'center',
  },
  evolutionContent: {
    flex: 1,
    padding: 20,
  },
  currentEvolution: {
    alignItems: 'center',
    marginBottom: 30,
  },
  nextEvolution: {
    alignItems: 'center',
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
  },
  evolutionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.deepNavy,
    marginBottom: 20,
  },
  evolutionLevelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.larkieBlue,
    marginTop: 15,
    marginBottom: 10,
  },
  evolutionDescription: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  evolutionProgress: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  evolutionProgressText: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
    fontWeight: '600',
    marginBottom: 8,
  },
  evolutionProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  evolutionProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary.larkieBlue,
    borderRadius: 4,
  },
});