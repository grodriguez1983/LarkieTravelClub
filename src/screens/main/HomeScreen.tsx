import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LarkieCharacter } from "../../components/LarkieCharacter";
import { Colors, gradients } from "../../constants/colors";
import { NavigationProps, User, PointTransaction } from "../../types";
import { StorageService } from "../../services/storage";
import {
  mockUser,
  mockPointHistory,
  getLarkieMessages,
  getMembershipLevelInfo,
  getUnreadNotificationCount,
} from "../../services/mockData";

const { width } = Dimensions.get("window");

export const HomeScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [user, setUser] = useState<User>(mockUser);
  const [recentActivity, setRecentActivity] = useState<PointTransaction[]>(
    mockPointHistory.slice(0, 5)
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);

  useEffect(() => {
    loadUserData();

    // Animate on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    console.log("HomeScreen mounted, user:", user.name);
    console.log("RecentActivity length:", recentActivity.length);
  }, []);

  const loadUserData = async () => {
    try {
      console.log("Loading user data...");
      setLoading(true);

      // Siempre usar datos mock para garantizar funcionalidad
      setUser(mockUser);
      setRecentActivity(mockPointHistory.slice(0, 5));

      // Load notification count
      const unreadCount = getUnreadNotificationCount();
      setNotificationCount(unreadCount);

      console.log("User data loaded:", mockUser.name);
      console.log(
        "Recent activity loaded:",
        mockPointHistory.length,
        "transactions"
      );
      console.log("Unread notifications:", unreadCount);
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fallback a datos mock
      setUser(mockUser);
      setRecentActivity(mockPointHistory.slice(0, 5));
      setNotificationCount(getUnreadNotificationCount());
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getContextualLarkieMessage = () => {
    const hour = new Date().getHours();
    const userName = user.name.split(" ")[0];

    if (hour >= 17 && hour < 20) {
      return `${userName}, don't miss tonight's happy hour - the margarita's on my list!`;
    } else if (hour >= 20 || hour < 7) {
      return `Welcome back, ${userName}! I saved you a tip for tomorrow's sunset.`;
    } else {
      return getLarkieMessages(userName, "welcome");
    }
  };

  const getLarkieContext = () => {
    const hour = new Date().getHours();
    if (hour >= 17) return "food"; // Evening - restaurant context
    if (hour >= 12 && hour < 17) return "pool"; // Afternoon - pool context
    return "default"; // Morning - default context
  };

  const membershipInfo = getMembershipLevelInfo(user.membershipLevel);
  const progressToNext = membershipInfo.nextLevel
    ? (user.totalPointsEarned / membershipInfo.pointsRequired) * 100
    : 100;

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "scan":
        navigation.navigate("Scanner");
        break;
      case "rewards":
        navigation.navigate("Rewards");
        break;
      case "map":
        navigation.navigate("Map");
        break;
      case "progress":
        navigation.navigate("Profile");
        break;
      case "checkin":
        navigation.navigate("PreCheckIn");
        break;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.primary.deepNavy}
        />
        <View style={styles.loadingContainer}>
          <LarkieCharacter
            context="default"
            message={`Welcome ${
              user.name.split(" ")[0]
            }! Loading your dashboard...`}
            userName={user.name.split(" ")[0]}
            size="large"
            showSpeechBubble={true}
          />
          <Text style={styles.loadingText}>Setting up your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.deepNavy}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={gradients.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.hotelName}>Larkie's Travel Club</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.pointsContainer}>
                <Ionicons
                  name="diamond"
                  size={16}
                  color={Colors.accent.goldRewards}
                />
                <Text style={styles.pointsText}>
                  {user.pointsBalance.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => navigation.navigate("Notifications")}
              >
                <Ionicons
                  name="notifications"
                  size={24}
                  color={Colors.neutral.white}
                />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View
          style={[styles.content, { backgroundColor: "rgba(255,0,0,0.1)" }]}
        >
          {/* Greeting & Larkie Section */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>
              {getGreeting()}, {user.name.split(" ")[0]}!
            </Text>
            {console.log("Rendering greeting for:", user.name)}

            <TouchableOpacity
              style={styles.larkieContainer}
              onPress={() => {
                // Show random tip or interaction
              }}
            >
              <LarkieCharacter
                context={getLarkieContext()}
                message={getContextualLarkieMessage()}
                userName={user.name.split(" ")[0]}
                size="medium"
                showSpeechBubble={true}
                onPress={() => {}}
              />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => handleQuickAction("scan")}
              >
                <Ionicons name="scan" size={24} color={Colors.neutral.white} />
                <Text style={styles.actionButtonTextPrimary}>Scan QR Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleQuickAction("rewards")}
              >
                <Ionicons
                  name="gift"
                  size={24}
                  color={Colors.primary.larkieBlue}
                />
                <Text style={styles.actionButtonText}>View Rewards</Text>
                <Text style={styles.actionButtonSubtext}>5 available</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleQuickAction("map")}
              >
                <Ionicons
                  name="map"
                  size={24}
                  color={Colors.primary.larkieBlue}
                />
                <Text style={styles.actionButtonText}>Hotel Map</Text>
                <Text style={styles.actionButtonSubtext}>3 undiscovered</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleQuickAction("progress")}
              >
                <Ionicons
                  name="trending-up"
                  size={24}
                  color={Colors.primary.larkieBlue}
                />
                <Text style={styles.actionButtonText}>My Progress</Text>
                <Text style={styles.actionButtonSubtext}>
                  {user.membershipLevel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleQuickAction("checkin")}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.primary.larkieBlue}
                />
                <Text style={styles.actionButtonText}>Pre-Check-In</Text>
                <Text style={styles.actionButtonSubtext}>Skip the queue</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Membership Status */}
          <View style={styles.membershipCard}>
            <View style={styles.membershipHeader}>
              <Text style={styles.membershipTitle}>Membership Status</Text>
              <Text
                style={[
                  styles.membershipLevel,
                  { color: membershipInfo.color },
                ]}
              >
                {user.membershipLevel}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(progressToNext, 100)}%`,
                      backgroundColor: membershipInfo.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {membershipInfo.nextLevel
                  ? `${
                      membershipInfo.pointsRequired - user.totalPointsEarned
                    } points to ${membershipInfo.nextLevel}`
                  : "Maximum level reached!"}
              </Text>
            </View>

            <View style={styles.larkiePreview}>
              <Text style={styles.larkiePreviewText}>
                "Keep exploring to unlock my next look!"
              </Text>
              <View style={styles.larkieEvolution}>
                <LarkieCharacter
                  key="current"
                  context="restaurant"
                  size="small"
                />
                {membershipInfo.nextLevel && (
                  <React.Fragment key="evolution">
                    <Ionicons
                      key="arrow"
                      name="arrow-forward"
                      size={16}
                      color={Colors.neutral.gray}
                    />
                    <LarkieCharacter key="next" context="formal" size="small" />
                  </React.Fragment>
                )}
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={
                        activity.type === "earned"
                          ? "add-circle"
                          : "remove-circle"
                      }
                      size={20}
                      color={
                        activity.type === "earned"
                          ? Colors.accent.successGreen
                          : Colors.primary.larkieBlue
                      }
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                    {activity.location && (
                      <Text style={styles.activityLocation}>
                        {activity.location}
                      </Text>
                    )}
                  </View>
                  <View style={styles.activityRight}>
                    <Text
                      style={[
                        styles.activityPoints,
                        {
                          color:
                            activity.type === "earned"
                              ? Colors.accent.successGreen
                              : "#E74C3C",
                        },
                      ]}
                    >
                      {activity.type === "earned" ? "+" : ""}
                      {activity.amount}
                    </Text>
                    <Text style={styles.activityTime}>
                      {formatTimeAgo(new Date(activity.timestamp))}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noActivity}>No recent activity</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
    marginBottom: Platform.OS === "android" ? 0 : -34,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutral.white,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 15,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginLeft: 5,
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#E74C3C",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  greetingSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 20,
  },
  larkieContainer: {
    alignItems: "center",
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: (width - 60) / 2,
    backgroundColor: Colors.neutral.white,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary.larkieBlue,
    width: width - 40,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary.deepNavy,
    marginTop: 8,
    textAlign: "center",
  },
  actionButtonTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.white,
    marginTop: 8,
    textAlign: "center",
  },
  actionButtonSubtext: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginTop: 2,
  },
  membershipCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  membershipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  membershipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
  membershipLevel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: "center",
  },
  larkiePreview: {
    alignItems: "center",
  },
  larkiePreviewText: {
    fontSize: 14,
    color: Colors.primary.larkieBlue,
    fontStyle: "italic",
    marginBottom: 10,
    textAlign: "center",
  },
  larkieEvolution: {
    flexDirection: "row",
    alignItems: "center",
  },
  activitySection: {
    marginBottom: 30,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary.deepNavy,
  },
  activityLocation: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginTop: 2,
  },
  activityRight: {
    alignItems: "flex-end",
  },
  activityPoints: {
    fontSize: 14,
    fontWeight: "bold",
  },
  activityTime: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginTop: 2,
  },
  noActivity: {
    textAlign: "center",
    color: Colors.neutral.gray,
    fontStyle: "italic",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral.lightGray,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    marginTop: 20,
    textAlign: "center",
  },
});
