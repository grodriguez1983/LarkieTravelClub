import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LarkieCharacter } from "../../components/LarkieCharacter";
import { Colors, gradients } from "../../constants/colors";
import {
  NavigationProps,
  User,
  Reward,
  RewardCategory,
  PointTransaction,
} from "../../types";
import { StorageService } from "../../services/storage";
import {
  mockUser,
  mockRewards,
  mockPointHistory,
} from "../../services/mockData";

const { width } = Dimensions.get("window");

export const RewardsScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [user, setUser] = useState<User>(mockUser);
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [pointHistory, setPointHistory] =
    useState<PointTransaction[]>(mockPointHistory);
  const [activeTab, setActiveTab] = useState<"rewards" | "history">("rewards");
  const [selectedCategory, setSelectedCategory] = useState<
    RewardCategory | "All"
  >("All");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showRedemptionSuccess, setShowRedemptionSuccess] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUser();
      if (userData) {
        setUser(userData);
      }

      const history = await StorageService.getPointHistory();
      setPointHistory(history);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const categories: (RewardCategory | "All")[] = [
    "All",
    "Food & Drink",
    "Experiences",
    "Room Upgrades",
    "Merchandise",
  ];

  const getFilteredRewards = () => {
    return rewards.filter(
      (reward) =>
        selectedCategory === "All" || reward.category === selectedCategory
    );
  };

  const getCategoryIcon = (category: RewardCategory) => {
    switch (category) {
      case "Food & Drink":
        return "wine";
      case "Experiences":
        return "flower";
      case "Room Upgrades":
        return "bed";
      case "Merchandise":
        return "gift";
      default:
        return "gift";
    }
  };

  const handleRewardPress = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRewardModal(true);
  };

  const handleRedeemReward = async () => {
    if (!selectedReward || user.pointsBalance < selectedReward.pointCost) {
      return;
    }

    try {
      // Deduct points
      const newBalance = user.pointsBalance - selectedReward.pointCost;
      await StorageService.updateUserPoints(newBalance, user.totalPointsEarned);

      // Add redemption transaction
      await StorageService.addPointTransaction({
        id: Date.now().toString(),
        type: "redeemed",
        amount: -selectedReward.pointCost,
        description: `${selectedReward.name} redeemed`,
        timestamp: new Date(),
      });

      // Update local state
      setUser((prev) => ({ ...prev, pointsBalance: newBalance }));

      setShowRewardModal(false);
      setShowRedemptionSuccess(true);

      // Auto-close success modal after 3 seconds
      setTimeout(() => {
        setShowRedemptionSuccess(false);
        setSelectedReward(null);
      }, 3000);
    } catch (error) {
      console.error("Error redeeming reward:", error);
      Alert.alert("Error", "Failed to redeem reward. Please try again.");
    }
  };

  const formatTransactionTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getTransactionIcon = (type: PointTransaction["type"]) => {
    switch (type) {
      case "earned":
        return "add-circle";
      case "redeemed":
        return "remove-circle";
      case "bonus":
        return "star";
      case "expired":
        return "time";
      default:
        return "help-circle";
    }
  };

  const getTransactionColor = (type: PointTransaction["type"]) => {
    switch (type) {
      case "earned":
      case "bonus":
        return Colors.accent.successGreen;
      case "redeemed":
        return "#E74C3C";
      case "expired":
        return Colors.neutral.gray;
      default:
        return Colors.neutral.gray;
    }
  };

  const canAffordReward = (reward: Reward) =>
    user.pointsBalance >= reward.pointCost;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.deepNavy}
      />

      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.pointsHeader}>
            <View style={styles.pointsContainer}>
              <Ionicons
                name="diamond"
                size={24}
                color={Colors.accent.goldRewards}
              />
              <Text style={styles.pointsText}>
                {user.pointsBalance.toLocaleString()}
              </Text>
            </View>
            <LarkieCharacter
              context="reward"
              message={
                user.pointsBalance >= 200
                  ? `${
                      user.name.split(" ")[0]
                    }, you've earned enough points for something special!`
                  : `Keep exploring, ${
                      user.name.split(" ")[0]
                    }! More rewards await!`
              }
              userName={user.name.split(" ")[0]}
              size="small"
              showSpeechBubble={true}
              customImage="larkie-formal"
            />
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "rewards" ? styles.tabActive : {}]}
          onPress={() => setActiveTab("rewards")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "rewards" ? styles.tabTextActive : {},
            ]}
          >
            Available Rewards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" ? styles.tabActive : {}]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" ? styles.tabTextActive : {},
            ]}
          >
            Points History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "rewards" && (
        <>
          {/* Category Filters */}
          <ScrollView
            horizontal
            style={styles.categoriesContainer}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category
                    ? styles.categoryChipActive
                    : {},
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category
                      ? styles.categoryChipTextActive
                      : {},
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Rewards Grid */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.rewardsGrid}>
              {getFilteredRewards().map((reward) => (
                <TouchableOpacity
                  key={reward.id}
                  style={[
                    styles.rewardCard,
                    !canAffordReward(reward) ? styles.rewardCardDisabled : {},
                  ]}
                  onPress={() => handleRewardPress(reward)}
                  disabled={!reward.available}
                >
                  {reward.isLarkiePick && (
                    <View style={styles.larkiePickBadge}>
                      <Ionicons
                        name="star"
                        size={12}
                        color={Colors.neutral.white}
                      />
                      <Text style={styles.larkiePickText}>Larkie's Pick</Text>
                    </View>
                  )}

                  <View style={styles.rewardImageContainer}>
                    <Ionicons
                      name={getCategoryIcon(reward.category)}
                      size={40}
                      color={
                        canAffordReward(reward)
                          ? Colors.primary.larkieBlue
                          : Colors.neutral.gray
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.rewardName,
                      !canAffordReward(reward) ? styles.rewardTextDisabled : {},
                    ]}
                  >
                    {reward.name}
                  </Text>

                  <View style={styles.rewardCost}>
                    <Ionicons
                      name="diamond"
                      size={16}
                      color={
                        canAffordReward(reward)
                          ? Colors.accent.goldRewards
                          : Colors.neutral.gray
                      }
                    />
                    <Text
                      style={[
                        styles.rewardCostText,
                        !canAffordReward(reward)
                          ? styles.rewardTextDisabled
                          : {},
                      ]}
                    >
                      {reward.pointCost}
                    </Text>
                  </View>

                  {!canAffordReward(reward) && (
                    <View style={styles.insufficientPointsOverlay}>
                      <Text style={styles.insufficientPointsText}>
                        Need {reward.pointCost - user.pointsBalance} more points
                      </Text>
                    </View>
                  )}

                  {!reward.available && (
                    <View style={styles.unavailableOverlay}>
                      <Text style={styles.unavailableText}>
                        Currently Unavailable
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {activeTab === "history" && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.historyContainer}>
            {pointHistory.length > 0 ? (
              pointHistory.map((transaction) => (
                <View key={transaction.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons
                      name={getTransactionIcon(transaction.type)}
                      size={20}
                      color={getTransactionColor(transaction.type)}
                    />
                  </View>

                  <View style={styles.historyContent}>
                    <Text style={styles.historyDescription}>
                      {transaction.description}
                    </Text>
                    {transaction.location && (
                      <Text style={styles.historyLocation}>
                        {transaction.location}
                      </Text>
                    )}
                    <Text style={styles.historyTime}>
                      {formatTransactionTime(new Date(transaction.timestamp))}
                    </Text>
                  </View>

                  <View style={styles.historyAmount}>
                    <Text
                      style={[
                        styles.historyAmountText,
                        { color: getTransactionColor(transaction.type) },
                      ]}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="receipt-outline"
                  size={64}
                  color={Colors.neutral.gray}
                />
                <Text style={styles.emptyStateText}>No transactions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start earning points by scanning QR codes around the hotel
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Reward Details Modal */}
      <Modal visible={showRewardModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.rewardModal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowRewardModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.neutral.gray} />
              </TouchableOpacity>
            </View>

            {selectedReward && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalRewardImage}>
                  <Ionicons
                    name={getCategoryIcon(selectedReward.category)}
                    size={80}
                    color={Colors.primary.larkieBlue}
                  />
                  {selectedReward.isLarkiePick && (
                    <View style={styles.modalLarkiePickBadge}>
                      <Ionicons
                        name="star"
                        size={16}
                        color={Colors.accent.goldRewards}
                      />
                      <Text style={styles.modalLarkiePickText}>
                        Larkie's Pick
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.modalRewardName}>
                  {selectedReward.name}
                </Text>
                <Text style={styles.modalRewardDescription}>
                  {selectedReward.description}
                </Text>

                <View style={styles.modalRewardCost}>
                  <Ionicons
                    name="diamond"
                    size={24}
                    color={Colors.accent.goldRewards}
                  />
                  <Text style={styles.modalRewardCostText}>
                    {selectedReward.pointCost} Points
                  </Text>
                </View>

                <View style={styles.modalTerms}>
                  <Text style={styles.modalTermsTitle}>Terms & Conditions</Text>
                  <Text style={styles.modalTermsText}>
                    {selectedReward.termsAndConditions}
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  !selectedReward || !canAffordReward(selectedReward)
                    ? styles.redeemButtonDisabled
                    : {},
                ]}
                onPress={handleRedeemReward}
                disabled={!selectedReward || !canAffordReward(selectedReward)}
              >
                <Text
                  style={[
                    styles.redeemButtonText,
                    !selectedReward || !canAffordReward(selectedReward)
                      ? styles.redeemButtonTextDisabled
                      : {},
                  ]}
                >
                  {selectedReward && canAffordReward(selectedReward)
                    ? "Redeem Now"
                    : "Not Enough Points"}
                </Text>
                {selectedReward && canAffordReward(selectedReward) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.neutral.white}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Redemption Success Modal */}
      <Modal visible={showRedemptionSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <LinearGradient
              colors={gradients.success}
              style={styles.successContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={Colors.neutral.white}
              />
              <Text style={styles.successTitle}>Reward Redeemed!</Text>
              <Text style={styles.successSubtitle}>
                Your {selectedReward?.name} is ready for pickup
              </Text>

              <LarkieCharacter
                context="achievement"
                message={`Congratulations ${
                  user.name.split(" ")[0]
                }! Enjoy your reward!`}
                userName={user.name.split(" ")[0]}
                size="medium"
                showSpeechBubble={true}
              />

              <View style={styles.successInstructions}>
                <Text style={styles.successInstructionsText}>
                  Show this confirmation at the front desk to claim your reward
                </Text>
                <View style={styles.confirmationCode}>
                  <Text style={styles.confirmationCodeText}>
                    Confirmation: #{Date.now().toString().slice(-6)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  pointsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pointsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.primary.larkieBlue,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.neutral.gray,
  },
  tabTextActive: {
    color: Colors.primary.larkieBlue,
    fontWeight: "600",
  },
  categoriesContainer: {
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    maxHeight: 50,
    borderBottomColor: Colors.neutral.lightGray,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  categoryChip: {
    backgroundColor: Colors.neutral.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary.larkieBlue,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: Colors.neutral.white,
  },
  scrollView: {
    flex: 1,
  },
  rewardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 20,
  },
  rewardCard: {
    width: (width - 60) / 2,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  larkiePickBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.accent.goldRewards,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  larkiePickText: {
    color: Colors.neutral.white,
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  rewardImageContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary.deepNavy,
    textAlign: "center",
    marginBottom: 8,
    minHeight: 35,
  },
  rewardCost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardCostText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginLeft: 4,
  },
  rewardTextDisabled: {
    color: Colors.neutral.gray,
  },
  insufficientPointsOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(231, 76, 60, 0.9)",
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  insufficientPointsText: {
    color: Colors.neutral.white,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  unavailableOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  historyContainer: {
    padding: 20,
  },
  historyItem: {
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
  historyIcon: {
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary.deepNavy,
  },
  historyLocation: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginTop: 2,
  },
  historyTime: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginTop: 4,
  },
  historyAmount: {
    alignItems: "flex-end",
  },
  historyAmountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.gray,
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  rewardModal: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalRewardImage: {
    alignItems: "center",
    marginVertical: 20,
    position: "relative",
  },
  modalLarkiePickBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: Colors.accent.goldRewards,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  modalLarkiePickText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  modalRewardName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    textAlign: "center",
    marginBottom: 10,
  },
  modalRewardDescription: {
    fontSize: 16,
    color: Colors.neutral.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  modalRewardCost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  modalRewardCostText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginLeft: 8,
  },
  modalTerms: {
    backgroundColor: Colors.neutral.lightGray,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalTermsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 8,
  },
  modalTermsText: {
    fontSize: 12,
    color: Colors.neutral.gray,
    lineHeight: 18,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
  },
  redeemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary.larkieBlue,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  redeemButtonDisabled: {
    backgroundColor: Colors.neutral.gray,
    shadowOpacity: 0,
    elevation: 0,
  },
  redeemButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  redeemButtonTextDisabled: {
    color: Colors.neutral.white,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModal: {
    width: width - 40,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  successContent: {
    alignItems: "center",
    padding: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.neutral.white,
    marginTop: 15,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.neutral.white,
    marginTop: 8,
    marginBottom: 20,
    textAlign: "center",
    opacity: 0.9,
  },
  successInstructions: {
    alignItems: "center",
    marginTop: 20,
  },
  successInstructionsText: {
    fontSize: 14,
    color: Colors.neutral.white,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 15,
  },
  confirmationCode: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  confirmationCodeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
});
