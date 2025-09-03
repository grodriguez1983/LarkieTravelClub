import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LarkieCharacter } from "../../components/LarkieCharacter";
import { Colors, gradients } from "../../constants/colors";
import { NavigationProps, RoomPreference, PropertyRecommendation } from "../../types";
import { 
  mockRoomPreferences, 
  mockPropertyRecommendations, 
  getArrivalTimeOptions,
  mockUser 
} from "../../services/mockData";

const { width } = Dimensions.get("window");

export const PreCheckInScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [selectedRoom, setSelectedRoom] = useState<RoomPreference | null>(null);
  const [selectedArrivalTime, setSelectedArrivalTime] = useState<string>("");
  const [guestCount, setGuestCount] = useState<number>(2);
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const arrivalTimes = getArrivalTimeOptions();
  const userName = mockUser.name.split(" ")[0];

  const handleRoomSelection = (room: RoomPreference) => {
    if (room.available) {
      setSelectedRoom(room);
    } else {
      Alert.alert(
        "Room Unavailable", 
        "This room type is currently unavailable for your dates."
      );
    }
  };

  const handlePreCheckIn = async () => {
    if (!selectedRoom) {
      Alert.alert("Room Selection Required", "Please select your preferred room type.");
      return;
    }

    if (!selectedArrivalTime) {
      Alert.alert("Arrival Time Required", "Please select your estimated arrival time.");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Pre-Check-In Complete! 🎉",
        `Welcome ${userName}! Your ${selectedRoom.name} is being prepared. You'll receive a notification when your room is ready.`,
        [
          {
            text: "Continue Exploring",
            onPress: () => navigation.navigate("Home")
          }
        ]
      );
    }, 2000);
  };

  const adjustGuestCount = (increment: boolean) => {
    if (increment && guestCount < 4) {
      setGuestCount(guestCount + 1);
    } else if (!increment && guestCount > 1) {
      setGuestCount(guestCount - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.white} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.primary.deepNavy} />
          </TouchableOpacity>

          <LarkieCharacter
            context="formal"
            message={`Ready to check in, ${userName}? Let me help you get the perfect room!`}
            userName={userName}
            size="medium"
            showSpeechBubble={true}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Pre-Check-In</Text>
          <Text style={styles.subtitle}>
            Complete your check-in details and I'll have everything ready for your arrival!
          </Text>
        </View>

        {/* Guest Count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Guests</Text>
          <View style={styles.guestCountContainer}>
            <TouchableOpacity 
              style={styles.guestButton}
              onPress={() => adjustGuestCount(false)}
            >
              <Ionicons name="remove" size={20} color={Colors.primary.deepNavy} />
            </TouchableOpacity>
            <Text style={styles.guestCount}>{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</Text>
            <TouchableOpacity 
              style={styles.guestButton}
              onPress={() => adjustGuestCount(true)}
            >
              <Ionicons name="add" size={20} color={Colors.primary.deepNavy} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Room Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="bed" size={18} color={Colors.primary.larkieBlue} /> Where will Larkie stay?
          </Text>
          <Text style={styles.sectionSubtitle}>Select your preferred room type</Text>
          
          {mockRoomPreferences.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={[
                styles.roomCard,
                selectedRoom?.id === room.id && styles.roomCardSelected,
                !room.available && styles.roomCardUnavailable
              ]}
              onPress={() => handleRoomSelection(room)}
            >
              <View style={styles.roomHeader}>
                <View>
                  <Text style={[
                    styles.roomName,
                    !room.available && styles.unavailableText
                  ]}>
                    {room.name}
                  </Text>
                  <Text style={styles.roomPrice}>{room.priceRange}</Text>
                </View>
                {selectedRoom?.id === room.id && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary.larkieBlue} />
                )}
                {!room.available && (
                  <Text style={styles.unavailableBadge}>Unavailable</Text>
                )}
              </View>
              
              <Text style={styles.roomDescription}>{room.description}</Text>
              
              {room.larkieRecommendation && (
                <View style={styles.larkieRecommendation}>
                  <Ionicons name="chatbubble" size={12} color={Colors.primary.larkieBlue} />
                  <Text style={styles.larkieRecommendationText}>
                    Larkie says: "{room.larkieRecommendation}"
                  </Text>
                </View>
              )}

              <View style={styles.amenitiesContainer}>
                {room.amenities.slice(0, 3).map((amenity, index) => (
                  <View key={index} style={styles.amenityTag}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
                {room.amenities.length > 3 && (
                  <Text style={styles.moreAmenities}>+{room.amenities.length - 3} more</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Arrival Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="time" size={18} color={Colors.primary.larkieBlue} /> Estimated Arrival Time
          </Text>
          <Text style={styles.sectionSubtitle}>When should I expect you?</Text>
          
          <View style={styles.timeOptionsContainer}>
            {arrivalTimes.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeOption,
                  selectedArrivalTime === time && styles.timeOptionSelected
                ]}
                onPress={() => setSelectedArrivalTime(time)}
              >
                <Text style={[
                  styles.timeOptionText,
                  selectedArrivalTime === time && styles.timeOptionTextSelected
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Larkie's Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="star" size={18} color={Colors.primary.larkieBlue} /> Larkie's First Recommendations
          </Text>
          <Text style={styles.sectionSubtitle}>Here's what I think you'll love!</Text>
          
          {mockPropertyRecommendations
            .filter(rec => rec.priority === 'high')
            .map((recommendation) => (
            <View key={recommendation.id} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: recommendation.category === 'dining' ? Colors.primary.larkieBlue : Colors.accent.successGreen }
                ]}>
                  <Text style={styles.categoryBadgeText}>
                    {recommendation.category.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.recommendationDescription}>
                {recommendation.description}
              </Text>
              
              <View style={styles.recommendationDetails}>
                <Text style={styles.recommendationLocation}>
                  <Ionicons name="location" size={12} color={Colors.neutral.gray} /> {recommendation.location}
                </Text>
                <Text style={styles.recommendationHours}>
                  <Ionicons name="time" size={12} color={Colors.neutral.gray} /> {recommendation.operatingHours}
                </Text>
              </View>
              
              <View style={styles.larkieNote}>
                <Ionicons name="chatbubble-ellipses" size={14} color={Colors.primary.larkieBlue} />
                <Text style={styles.larkieNoteText}>
                  {recommendation.larkieNote}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Complete Pre-Check-In Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            (!selectedRoom || !selectedArrivalTime) && styles.completeButtonDisabled
          ]}
          onPress={handlePreCheckIn}
          disabled={!selectedRoom || !selectedArrivalTime || loading}
        >
          <LinearGradient
            colors={(!selectedRoom || !selectedArrivalTime) ? 
              [Colors.neutral.lightGray, Colors.neutral.lightGray] : 
              gradients.primary
            }
            style={styles.completeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[
              styles.completeButtonText,
              (!selectedRoom || !selectedArrivalTime) && styles.completeButtonTextDisabled
            ]}>
              {loading ? "Processing..." : "Complete Pre-Check-In"}
            </Text>
            {!loading && selectedRoom && selectedArrivalTime && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.neutral.white} />
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 20,
    padding: 8,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 20,
  },
  guestCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 12,
    paddingVertical: 16,
  },
  guestButton: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  guestCount: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary.deepNavy,
  },
  roomCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomCardSelected: {
    borderColor: Colors.primary.larkieBlue,
    backgroundColor: '#F8FEFF',
  },
  roomCardUnavailable: {
    opacity: 0.5,
    borderColor: Colors.neutral.gray,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
  roomPrice: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginTop: 2,
  },
  unavailableText: {
    color: Colors.neutral.gray,
  },
  unavailableBadge: {
    fontSize: 12,
    color: Colors.neutral.white,
    backgroundColor: Colors.neutral.gray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomDescription: {
    fontSize: 14,
    color: Colors.neutral.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  larkieRecommendation: {
    flexDirection: "row",
    backgroundColor: '#E8F5FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  larkieRecommendationText: {
    fontSize: 12,
    color: Colors.primary.deepNavy,
    fontStyle: "italic",
    marginLeft: 6,
    flex: 1,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  amenityTag: {
    backgroundColor: Colors.neutral.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 12,
    color: Colors.primary.deepNavy,
  },
  moreAmenities: {
    fontSize: 12,
    color: Colors.neutral.gray,
    fontStyle: "italic",
  },
  timeOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeOption: {
    backgroundColor: Colors.neutral.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: width * 0.28,
    alignItems: "center",
  },
  timeOptionSelected: {
    backgroundColor: Colors.primary.larkieBlue,
  },
  timeOptionText: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
    fontWeight: "500",
  },
  timeOptionTextSelected: {
    color: Colors.neutral.white,
    fontWeight: "600",
  },
  recommendationCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.larkieBlue,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.neutral.white,
  },
  recommendationDescription: {
    fontSize: 14,
    color: Colors.neutral.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationDetails: {
    marginBottom: 12,
  },
  recommendationLocation: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginBottom: 4,
  },
  recommendationHours: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  larkieNote: {
    flexDirection: "row",
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    alignItems: "flex-start",
  },
  larkieNoteText: {
    fontSize: 12,
    color: Colors.primary.deepNavy,
    fontStyle: "italic",
    marginLeft: 6,
    flex: 1,
  },
  completeButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  completeButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  completeButtonTextDisabled: {
    color: Colors.neutral.gray,
  },
  bottomSpacer: {
    height: 20,
  },
});