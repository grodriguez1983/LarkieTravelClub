import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LarkieCharacter } from "../../components/LarkieCharacter";
import { Colors } from "../../constants/colors";
import { NavigationProps, Location, LocationCategory } from "../../types";
import { StorageService } from "../../services/storage";
import { mockLocations } from "../../services/mockData";

const { width, height } = Dimensions.get("window");

const MAP_WIDTH = width - 40;
const MAP_HEIGHT = height * 0.5;

interface MapMarker {
  location: Location;
  x: number;
  y: number;
  discovered: boolean;
}

export const MapScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<
    LocationCategory | "All"
  >("All");
  const [discoveredLocations, setDiscoveredLocations] = useState<string[]>([]);

  useEffect(() => {
    loadDiscoveredLocations();
  }, []);

  const loadDiscoveredLocations = async () => {
    const discovered = await StorageService.getDiscoveredLocations();
    setDiscoveredLocations(discovered.map((loc) => loc.id));
  };

  const getMapMarkers = (): MapMarker[] => {
    return locations
      .filter(
        (location) =>
          filterCategory === "All" || location.category === filterCategory
      )
      .map((location) => ({
        location,
        x: location.coordinates.x * MAP_WIDTH,
        y: location.coordinates.y * MAP_HEIGHT,
        discovered: discoveredLocations.includes(location.id),
      }));
  };

  const handleMarkerPress = (location: Location) => {
    setSelectedLocation(location);
    setShowLocationModal(true);
  };

  const getCategoryIcon = (category: LocationCategory) => {
    switch (category) {
      case "Restaurant":
        return "restaurant";
      case "Bar":
        return "wine";
      case "Pool":
        return "water";
      case "Spa":
        return "flower";
      case "Amenity":
        return "fitness";
      case "Lobby":
        return "business";
      case "Hidden Gem":
        return "diamond";
      default:
        return "location";
    }
  };

  const getMarkerColor = (marker: MapMarker) => {
    if (marker.discovered) {
      return Colors.accent.successGreen;
    }
    if (marker.location.category === "Hidden Gem") {
      return Colors.accent.goldRewards;
    }
    return Colors.neutral.gray;
  };

  const getDiscoveryProgress = () => {
    const discoveredCount = locations.filter((loc) =>
      discoveredLocations.includes(loc.id)
    ).length;
    return {
      discovered: discoveredCount,
      total: locations.length,
      percentage: Math.round((discoveredCount / locations.length) * 100),
    };
  };

  const handleScanQRCode = () => {
    setShowLocationModal(false);
    navigation.navigate("Scanner");
  };

  const categories: (LocationCategory | "All")[] = [
    "All",
    "Restaurant",
    "Bar",
    "Amenity",
    "Hidden Gem",
  ];

  const progress = getDiscoveryProgress();
  const markers = getMapMarkers();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.neutral.white}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hotel Map</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {progress.discovered}/{progress.total} discovered
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress.percentage}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        style={styles.filtersContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              filterCategory === category ? styles.filterChipActive : {},
            ]}
            onPress={() => setFilterCategory(category)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterCategory === category ? styles.filterChipTextActive : {},
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Interactive Map */}
        <View style={styles.mapContainer}>
          <View style={[styles.map, { width: MAP_WIDTH, height: MAP_HEIGHT }]}>
            {/* Hotel Building Background */}
            <View style={styles.hotelBuilding}>
              <Text style={styles.hotelBuildingText}>Hotel Building</Text>
            </View>

            {/* Pool Area */}
            <View style={styles.poolArea}>
              <Text style={styles.areaLabel}>Pool Area</Text>
            </View>

            {/* Restaurant Area */}
            <View style={styles.restaurantArea}>
              <Text style={styles.areaLabel}>Dining</Text>
            </View>

            {/* Location Markers */}
            {markers.map((marker) => (
              <TouchableOpacity
                key={marker.location.id}
                style={[
                  styles.marker,
                  {
                    left: marker.x - 15,
                    top: marker.y - 15,
                    backgroundColor: getMarkerColor(marker),
                  },
                ]}
                onPress={() => handleMarkerPress(marker.location)}
              >
                <Ionicons
                  name={getCategoryIcon(marker.location.category)}
                  size={16}
                  color={Colors.neutral.white}
                />
                {marker.location.category === "Hidden Gem" &&
                  !marker.discovered && (
                    <View style={styles.sparkleEffect}>
                      <Ionicons
                        name="sparkles"
                        size={12}
                        color={Colors.accent.goldRewards}
                      />
                    </View>
                  )}
              </TouchableOpacity>
            ))}

            {/* User Location (always at lobby) */}
            <View
              style={[
                styles.userMarker,
                { left: MAP_WIDTH * 0.5 - 8, top: MAP_HEIGHT * 0.5 - 8 },
              ]}
            >
              <View style={styles.userDot} />
            </View>
          </View>
        </View>

        {/* Map Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Map Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendMarker,
                  { backgroundColor: Colors.accent.successGreen },
                ]}
              />
              <Text style={styles.legendText}>Discovered</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendMarker,
                  { backgroundColor: Colors.neutral.gray },
                ]}
              />
              <Text style={styles.legendText}>Undiscovered</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendMarker,
                  { backgroundColor: Colors.accent.goldRewards },
                ]}
              />
              <Text style={styles.legendText}>Hidden Gem</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.userMarker}>
                <View style={styles.userDot} />
              </View>
              <Text style={styles.legendText}>Your Location</Text>
            </View>
          </View>
        </View>

        {/* Larkie Tips Section */}
        <View style={styles.tipsSection}>
          <LarkieCharacter
            context="exploration"
            message="Tap any marker to learn more about that location!"
            userName="Explorer"
            size="medium"
            showSpeechBubble={true}
          />
        </View>
      </ScrollView>

      {/* Location Details Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.locationModal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View
                  style={[
                    styles.modalCategoryIcon,
                    {
                      backgroundColor: discoveredLocations.includes(
                        selectedLocation?.id || ""
                      )
                        ? Colors.accent.successGreen
                        : Colors.neutral.gray,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      selectedLocation
                        ? getCategoryIcon(selectedLocation.category)
                        : "location"
                    }
                    size={20}
                    color={Colors.neutral.white}
                  />
                </View>
                <View>
                  <Text style={styles.modalLocationName}>
                    {selectedLocation?.name}
                  </Text>
                  <Text style={styles.modalLocationCategory}>
                    {selectedLocation?.category}
                    {discoveredLocations.includes(
                      selectedLocation?.id || ""
                    ) && (
                      <Text style={styles.discoveredBadge}> • Discovered</Text>
                    )}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowLocationModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.neutral.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                {selectedLocation?.description}
              </Text>

              {selectedLocation?.operatingHours && (
                <View style={styles.modalInfo}>
                  <Ionicons name="time" size={16} color={Colors.neutral.gray} />
                  <Text style={styles.modalInfoText}>
                    {selectedLocation.operatingHours}
                  </Text>
                </View>
              )}

              <View style={styles.modalInfo}>
                <Ionicons
                  name="diamond"
                  size={16}
                  color={Colors.accent.goldRewards}
                />
                <Text style={styles.modalInfoText}>
                  {selectedLocation?.pointValue} points for first visit
                </Text>
              </View>

              {selectedLocation?.specialOffer && (
                <View style={styles.specialOfferCard}>
                  <Ionicons
                    name="star"
                    size={16}
                    color={Colors.accent.goldRewards}
                  />
                  <Text style={styles.specialOfferText}>
                    {selectedLocation.specialOffer}
                  </Text>
                </View>
              )}

              {selectedLocation?.tips && selectedLocation.tips.length > 0 && (
                <View style={styles.tipsCard}>
                  <Text style={styles.tipsTitle}>Larkie's Tips</Text>
                  {selectedLocation.tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Ionicons
                        name="bulb"
                        size={14}
                        color={Colors.primary.larkieBlue}
                      />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleScanQRCode}
              >
                <Ionicons name="scan" size={18} color={Colors.neutral.white} />
                <Text style={styles.modalButtonPrimaryText}>Scan QR Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginRight: 10,
    minWidth: 90,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent.successGreen,
    borderRadius: 3,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    maxHeight: 50,
    borderBottomColor: Colors.neutral.lightGray,
  },
  filtersContent: {
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  filterChip: {
    backgroundColor: Colors.neutral.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.larkieBlue,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: Colors.neutral.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  mapContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  map: {
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.primary.deepNavy,
  },
  hotelBuilding: {
    position: "absolute",
    left: "30%",
    top: "20%",
    width: "40%",
    height: "60%",
    backgroundColor: Colors.primary.steelBlue,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
  },
  hotelBuildingText: {
    color: Colors.neutral.white,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  poolArea: {
    position: "absolute",
    left: "10%",
    bottom: "20%",
    width: "25%",
    height: "20%",
    backgroundColor: Colors.primary.larkieBlue,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.6,
  },
  restaurantArea: {
    position: "absolute",
    right: "10%",
    top: "15%",
    width: "20%",
    height: "25%",
    backgroundColor: Colors.accent.goldRewards,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.6,
  },
  areaLabel: {
    color: Colors.neutral.white,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  marker: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.neutral.white,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  sparkleEffect: {
    position: "absolute",
    top: -5,
    right: -5,
  },
  userMarker: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    borderColor: Colors.primary.deepNavy,
    justifyContent: "center",
    alignItems: "center",
  },
  userDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.deepNavy,
  },
  legendContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "48%",
  },
  legendMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.white,
  },
  legendText: {
    fontSize: 12,
    color: Colors.neutral.gray,
    flex: 1,
  },
  tipsSection: {
    alignItems: "center",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  locationModal: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalLocationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
  modalLocationCategory: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginTop: 2,
  },
  discoveredBadge: {
    color: Colors.accent.successGreen,
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    padding: 20,
    maxHeight: height * 0.5,
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.neutral.gray,
    lineHeight: 22,
    marginBottom: 15,
  },
  modalInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalInfoText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginLeft: 8,
  },
  specialOfferCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.lightGray,
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.goldRewards,
  },
  specialOfferText: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  tipsCard: {
    backgroundColor: Colors.neutral.lightGray,
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary.larkieBlue,
  },
  modalButtonSecondary: {
    backgroundColor: Colors.neutral.lightGray,
    borderWidth: 1,
    borderColor: Colors.neutral.gray,
  },
  modalButtonPrimaryText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  modalButtonSecondaryText: {
    color: Colors.neutral.gray,
    fontSize: 14,
    fontWeight: "600",
  },
});
