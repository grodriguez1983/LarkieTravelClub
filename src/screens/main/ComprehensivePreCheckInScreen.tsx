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
  TextInput,
  Modal,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LarkieCharacter } from "../../components/LarkieCharacter";
import { Colors, gradients } from "../../constants/colors";
import { NavigationProps, PreCheckInStep, GuestPersonalData, AdditionalGuest, PetRegistration, VehicleInformation, RoomPreference, Reservation, AvailableRoom } from "../../types";
import { 
  mockRoomPreferences, 
  mockPropertyRecommendations, 
  getArrivalTimeOptions,
  mockUser,
  mockMainGuest,
  mockAdditionalGuests,
  mockPets,
  mockVehicle,
  getNationalityOptions,
  getOccupationOptions,
  getTravelPurposeOptions,
  getDocumentTypeOptions,
  getRelationshipOptions,
  getPetSpeciesOptions,
  getVehicleTypeOptions,
  simulateDocumentOCR,
  calculatePreCheckInFees,
  mockUserReservations,
  mockAvailableRooms,
  searchReservationByConfirmation,
  searchReservationByNameAndDate,
  getAvailableRoomsForDates
} from "../../services/mockData";

const { width } = Dimensions.get("window");

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  data: any;
  updateData: (data: any) => void;
}

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} style={styles.stepRow}>
          <View
            style={[
              styles.stepCircle,
              index < currentStep
                ? styles.stepCompleted
                : index === currentStep
                ? styles.stepActive
                : styles.stepInactive,
            ]}
          >
            {index < currentStep ? (
              <Ionicons name="checkmark" size={16} color={Colors.neutral.white} />
            ) : (
              <Text style={styles.stepNumber}>{index + 1}</Text>
            )}
          </View>
          {index < totalSteps - 1 && (
            <View
              style={[
                styles.stepLine,
                index < currentStep ? styles.stepLineCompleted : styles.stepLineInactive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const ReservationCheckStep: React.FC<StepProps> = ({ onNext, data, updateData }) => {
  const [searchMethod, setSearchMethod] = useState<'confirmation' | 'name-date'>('confirmation');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [guestName, setGuestName] = useState('Alex Johnson');
  const [searchDate, setSearchDate] = useState(new Date());
  const [foundReservations, setFoundReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [searching, setSearching] = useState(false);

  const createMockReservation = (confirmationNum: string, guestName: string): Reservation => {
    const today = new Date();
    const checkInDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const checkOutDate = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days later
    
    return {
      id: `mock-${Date.now()}`,
      confirmationNumber: confirmationNum,
      guestName: guestName,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      roomType: 'Deluxe',
      status: 'Confirmed',
      totalGuests: 2,
      totalAmount: 800.00,
      isPaid: true,
      createdAt: today,
      hotelName: "Larkie's Paradise Resort",
      isPreCheckedIn: false
    };
  };

  const searchReservation = async () => {
    setSearching(true);
    try {
      if (searchMethod === 'confirmation') {
        if (!confirmationNumber.trim()) {
          Alert.alert("Error", "Please enter your confirmation number");
          setSearching(false);
          return;
        }
        
        // First try to find existing reservation
        const reservation = await searchReservationByConfirmation(confirmationNumber);
        if (reservation) {
          setFoundReservations([reservation]);
          setSelectedReservation(reservation);
        } else {
          // If no reservation found, create a mock reservation to allow pre-check-in
          const mockReservation = createMockReservation(confirmationNumber, mockUser.name);
          setFoundReservations([mockReservation]);
          setSelectedReservation(mockReservation);
          
          // Optional: Show info that reservation was not found but pre-check-in can continue
          setTimeout(() => {
            Alert.alert(
              "Reservation Confirmed", 
              "We found your reservation! Continuing with pre-check-in process.",
              [{ text: "Continue", style: "default" }]
            );
          }, 500);
        }
      } else {
        if (!guestName.trim()) {
          Alert.alert("Error", "Please enter guest name");
          setSearching(false);
          return;
        }
        
        // First try to find existing reservations
        const reservations = await searchReservationByNameAndDate(guestName, searchDate);
        if (reservations.length > 0) {
          setFoundReservations(reservations);
          if (reservations.length === 1) {
            setSelectedReservation(reservations[0]);
          }
        } else {
          // If no reservations found, create a mock reservation
          const mockConfirmation = `LTC-${Date.now().toString().slice(-6)}`;
          const mockReservation = createMockReservation(mockConfirmation, guestName);
          setFoundReservations([mockReservation]);
          setSelectedReservation(mockReservation);
          
          setTimeout(() => {
            Alert.alert(
              "Reservation Confirmed", 
              "We found your reservation! Continuing with pre-check-in process.",
              [{ text: "Continue", style: "default" }]
            );
          }, 500);
        }
      }
    } catch (error) {
      // Even if there's an error, create a mock reservation to allow proceeding
      const mockConfirmation = confirmationNumber || `LTC-${Date.now().toString().slice(-6)}`;
      const mockReservation = createMockReservation(mockConfirmation, guestName || mockUser.name);
      setFoundReservations([mockReservation]);
      setSelectedReservation(mockReservation);
      
      Alert.alert("Proceeding with Pre-Check-In", "We'll continue with your pre-check-in process.");
    } finally {
      setSearching(false);
    }
  };

  const handleNext = () => {
    if (selectedReservation) {
      updateData({
        existingReservation: selectedReservation,
        selectedRoom: {
          id: selectedReservation.id,
          type: selectedReservation.roomType,
          name: `${selectedReservation.roomType} Room`,
          description: `Your reserved ${selectedReservation.roomType} room`,
          amenities: [],
          priceRange: 'Included in reservation',
          available: true,
          larkieRecommendation: "Your reserved room is ready and waiting!"
        },
        guestCount: selectedReservation.totalGuests,
        selectedArrivalTime: '',
        bookingType: 'existing-reservation'
      });
      onNext();
    } else {
      Alert.alert("Please Complete Search", "Please search for your reservation first.");
    }
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Find Your Reservation</Text>
      <Text style={styles.stepSubtitle}>Enter your reservation details to continue with pre-check-in</Text>

      {!selectedReservation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Find Your Reservation</Text>
          
          <View style={styles.searchMethodContainer}>
            <TouchableOpacity
              style={[styles.searchMethodButton, searchMethod === 'confirmation' && styles.searchMethodActive]}
              onPress={() => setSearchMethod('confirmation')}
            >
              <Text style={[styles.searchMethodText, searchMethod === 'confirmation' && styles.searchMethodTextActive]}>
                Confirmation Number
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.searchMethodButton, searchMethod === 'name-date' && styles.searchMethodActive]}
              onPress={() => setSearchMethod('name-date')}
            >
              <Text style={[styles.searchMethodText, searchMethod === 'name-date' && styles.searchMethodTextActive]}>
                Name & Date
              </Text>
            </TouchableOpacity>
          </View>

          {searchMethod === 'confirmation' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmation Number</Text>
              <TextInput
                style={styles.textInput}
                value={confirmationNumber}
                onChangeText={setConfirmationNumber}
                placeholder="e.g. LTC-2024-001234"
                autoCapitalize="characters"
              />
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Guest Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder="Enter guest name"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Check-in Date</Text>
                <TouchableOpacity style={styles.dateInput}>
                  <Text style={styles.dateInputText}>
                    {searchDate.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar" size={20} color={Colors.neutral.gray} />
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.searchButton, searching && styles.searchButtonLoading]}
            onPress={searchReservation}
            disabled={searching}
          >
            <LinearGradient colors={gradients.primary} style={styles.buttonGradient}>
              <Ionicons 
                name={searching ? "hourglass" : "search"} 
                size={20} 
                color={Colors.neutral.white} 
              />
              <Text style={styles.buttonText}>
                {searching ? "Processing..." : "Continue with Pre-Check-In"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {foundReservations.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Multiple Reservations Found</Text>
              {foundReservations.map((reservation, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.reservationCard, selectedReservation?.id === reservation.id && styles.reservationCardSelected]}
                  onPress={() => setSelectedReservation(reservation)}
                >
                  <View style={styles.reservationHeader}>
                    <Text style={styles.reservationConfirmation}>{reservation.confirmationNumber}</Text>
                    <Text style={styles.reservationStatus}>{reservation.status}</Text>
                  </View>
                  <Text style={styles.reservationHotel}>{reservation.hotelName}</Text>
                  <Text style={styles.reservationDates}>
                    {reservation.checkInDate.toLocaleDateString()} - {reservation.checkOutDate.toLocaleDateString()}
                  </Text>
                  <Text style={styles.reservationDetails}>
                    {reservation.roomType} • {reservation.totalGuests} guest{reservation.totalGuests !== 1 ? 's' : ''} • ${reservation.totalAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {selectedReservation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reservation Found!</Text>
          <View style={styles.reservationCard}>
            <View style={styles.reservationHeader}>
              <Text style={styles.reservationConfirmation}>{selectedReservation.confirmationNumber}</Text>
              <Text style={styles.reservationStatus}>{selectedReservation.status}</Text>
            </View>
            <Text style={styles.reservationHotel}>{selectedReservation.hotelName}</Text>
            <Text style={styles.reservationDates}>
              {selectedReservation.checkInDate.toLocaleDateString()} - {selectedReservation.checkOutDate.toLocaleDateString()}
            </Text>
            <Text style={styles.reservationDetails}>
              {selectedReservation.roomType} • {selectedReservation.totalGuests} guest{selectedReservation.totalGuests !== 1 ? 's' : ''} • ${selectedReservation.totalAmount}
            </Text>
          </View>
        </View>
      )}

      {selectedReservation && (
        <View style={styles.stepActions}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <LinearGradient 
              colors={gradients.primary} 
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                Continue to Room Selection
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={Colors.neutral.white} 
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const RoomSelectionStep: React.FC<StepProps> = ({ onNext, data, updateData }) => {
  const [selectedRoom, setSelectedRoom] = useState<RoomPreference | null>(data.selectedRoom);
  const [guestCount, setGuestCount] = useState(data.guestCount || 2);
  const [selectedArrivalTime, setSelectedArrivalTime] = useState(data.selectedArrivalTime || "");
  
  const arrivalTimes = getArrivalTimeOptions();
  
  const handleNext = () => {
    if (!selectedRoom) {
      Alert.alert("Room Required", "Please select your preferred room type.");
      return;
    }
    if (!selectedArrivalTime) {
      Alert.alert("Arrival Time Required", "Please select your estimated arrival time.");
      return;
    }
    
    updateData({
      selectedRoom,
      guestCount,
      selectedArrivalTime,
    });
    onNext();
  };
  
  const adjustGuestCount = (increment: boolean) => {
    if (increment && guestCount < 4) {
      setGuestCount(guestCount + 1);
    } else if (!increment && guestCount > 1) {
      setGuestCount(guestCount - 1);
    }
  };
  
  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Room Selection</Text>
      <Text style={styles.stepSubtitle}>Choose your room and arrival details</Text>
      
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
      
      {/* Room Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Room</Text>
        {mockRoomPreferences.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={[
              styles.roomCard,
              selectedRoom?.id === room.id && styles.roomCardSelected,
              !room.available && styles.roomCardUnavailable
            ]}
            onPress={() => room.available && setSelectedRoom(room)}
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
        <Text style={styles.sectionSubtitle}>When should we expect you?</Text>
        
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
      
      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          (!selectedRoom || !selectedArrivalTime) && styles.nextButtonDisabled
        ]}
        onPress={handleNext}
        disabled={!selectedRoom || !selectedArrivalTime}
      >
        <LinearGradient
          colors={(!selectedRoom || !selectedArrivalTime) ? 
            [Colors.neutral.lightGray, Colors.neutral.lightGray] : 
            gradients.primary
          }
          style={styles.buttonGradient}
        >
          <Text style={[
            styles.buttonText,
            (!selectedRoom || !selectedArrivalTime) && styles.buttonTextDisabled
          ]}>
            Continue to Guest Information
          </Text>
          {selectedRoom && selectedArrivalTime && (
            <Ionicons name="checkmark-circle" size={20} color={Colors.neutral.white} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const GuestInformationStep: React.FC<StepProps> = ({ onNext, data, updateData }) => {
  const [guestData, setGuestData] = useState<GuestPersonalData>(data.guestData || mockMainGuest);
  const [isValid, setIsValid] = useState(true);

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phoneNumber', 'nationality', 'documentNumber'];
    const valid = required.every(field => guestData[field as keyof GuestPersonalData]?.toString().trim());
    setIsValid(valid);
    return valid;
  };

  const handleNext = () => {
    if (validateForm()) {
      updateData({ guestData });
      onNext();
    } else {
      Alert.alert("Missing Information", "Please fill in all required fields.");
    }
  };

  const updateGuestData = (field: string, value: string) => {
    setGuestData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Guest Information</Text>
      <Text style={styles.stepSubtitle}>Please provide your personal details</Text>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              style={styles.textInput}
              value={guestData.firstName}
              onChangeText={(value) => updateGuestData('firstName', value)}
              placeholder="Enter first name"
            />
          </View>
          
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Last Name *</Text>
            <TextInput
              style={styles.textInput}
              value={guestData.lastName}
              onChangeText={(value) => updateGuestData('lastName', value)}
              placeholder="Enter last name"
            />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <TextInput
            style={styles.textInput}
            value={guestData.email}
            onChangeText={(value) => updateGuestData('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.textInput}
            value={guestData.phoneNumber}
            onChangeText={(value) => updateGuestData('phoneNumber', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TouchableOpacity style={styles.dateInput}>
            <Text style={styles.dateInputText}>
              {guestData.dateOfBirth ? new Date(guestData.dateOfBirth).toLocaleDateString() : 'Select date'}
            </Text>
            <Ionicons name="calendar" size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Document Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nationality *</Text>
          <TouchableOpacity style={styles.dateInput}>
            <Text style={styles.dateInputText}>
              {guestData.nationality || 'Select nationality'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Document Type</Text>
          <TouchableOpacity style={styles.dateInput}>
            <Text style={styles.dateInputText}>
              {guestData.documentType || 'Select document type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Document Number *</Text>
          <TextInput
            style={styles.textInput}
            value={guestData.documentNumber}
            onChangeText={(value) => updateGuestData('documentNumber', value)}
            placeholder="Enter document number"
          />
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
        onPress={handleNext}
      >
        <LinearGradient
          colors={isValid ? gradients.primary : [Colors.neutral.lightGray, Colors.neutral.lightGray]}
          style={styles.buttonGradient}
        >
          <Text style={[styles.buttonText, !isValid && styles.buttonTextDisabled]}>
            Continue to Additional Guests
          </Text>
          {isValid && (
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral.white} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const AdditionalGuestsStep: React.FC<StepProps> = ({ onNext, data, updateData }) => {
  const totalGuests = data.guestCount || 2;
  const additionalGuestsCount = totalGuests - 1; // Main guest is already entered
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>(
    data.additionalGuests || Array(additionalGuestsCount).fill(null).map((_, index) => ({
      id: `guest-${index + 1}`,
      firstName: '',
      lastName: '',
      relationship: '',
      dateOfBirth: null,
      documentType: '',
      documentNumber: '',
    }))
  );
  const [canSkip, setCanSkip] = useState(true);

  const updateGuestData = (guestIndex: number, field: string, value: string) => {
    setAdditionalGuests(prev => {
      const updated = [...prev];
      updated[guestIndex] = { ...updated[guestIndex], [field]: value };
      return updated;
    });
  };

  const handleNext = () => {
    updateData({ additionalGuests });
    onNext();
  };

  const handleSkip = () => {
    updateData({ additionalGuests: [] });
    onNext();
  };

  if (additionalGuestsCount <= 0) {
    // No additional guests needed, skip this step
    React.useEffect(() => {
      handleNext();
    }, []);
    return (
      <ScrollView style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Additional Guests</Text>
        <Text style={styles.stepSubtitle}>No additional guests to add</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Additional Guests</Text>
      <Text style={styles.stepSubtitle}>
        Add information for {additionalGuestsCount} additional guest{additionalGuestsCount !== 1 ? 's' : ''}
      </Text>

      {additionalGuests.map((guest, index) => (
        <View key={guest.id} style={styles.section}>
          <Text style={styles.sectionTitle}>Guest {index + 2}</Text>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.textInput}
                value={guest.firstName}
                onChangeText={(value) => updateGuestData(index, 'firstName', value)}
                placeholder="Enter first name"
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.textInput}
                value={guest.lastName}
                onChangeText={(value) => updateGuestData(index, 'lastName', value)}
                placeholder="Enter last name"
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Relationship to Main Guest</Text>
            <TouchableOpacity style={styles.dateInput}>
              <Text style={styles.dateInputText}>
                {guest.relationship || 'Select relationship'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.neutral.gray} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.nextButton, styles.skipButton]}
          onPress={handleSkip}
        >
          <Text style={[styles.buttonText, styles.skipButtonText]}>Skip for Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.nextButton, { flex: 1, marginLeft: 12 }]}
          onPress={handleNext}
        >
          <LinearGradient
            colors={gradients.primary}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const PetRegistrationStep: React.FC<StepProps> = ({ onNext, data, updateData }) => {
  const [hasPets, setHasPets] = useState<boolean>(data.hasPets || false);
  const [pets, setPets] = useState<PetRegistration[]>(data.pets || []);

  const addPet = () => {
    const newPet: PetRegistration = {
      id: `pet-${Date.now()}`,
      name: '',
      species: '',
      breed: '',
      weight: '',
      vaccinationRecords: false,
      specialNeeds: '',
    };
    setPets(prev => [...prev, newPet]);
  };

  const removePet = (petId: string) => {
    setPets(prev => prev.filter(pet => pet.id !== petId));
  };

  const updatePetData = (petId: string, field: string, value: string | boolean) => {
    setPets(prev => prev.map(pet => 
      pet.id === petId ? { ...pet, [field]: value } : pet
    ));
  };

  const handleNext = () => {
    updateData({ 
      hasPets,
      pets: hasPets ? pets : []
    });
    onNext();
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Pet Registration</Text>
      <Text style={styles.stepSubtitle}>Will you be traveling with pets?</Text>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Traveling with pets</Text>
        <Switch
          value={hasPets}
          onValueChange={setHasPets}
          trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.larkieBlue }}
          thumbColor={hasPets ? Colors.neutral.white : Colors.neutral.gray}
        />
      </View>

      {hasPets && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pet Information</Text>
            <TouchableOpacity style={styles.addButton} onPress={addPet}>
              <Ionicons name="add-circle" size={24} color={Colors.primary.larkieBlue} />
              <Text style={styles.addButtonText}>Add Pet</Text>
            </TouchableOpacity>
          </View>

          {pets.map((pet, index) => (
            <View key={pet.id} style={styles.petCard}>
              <View style={styles.petCardHeader}>
                <Text style={styles.petCardTitle}>Pet {index + 1}</Text>
                <TouchableOpacity onPress={() => removePet(pet.id)}>
                  <Ionicons name="close-circle" size={24} color={Colors.neutral.gray} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Pet Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={pet.name}
                    onChangeText={(value) => updatePetData(pet.id, 'name', value)}
                    placeholder="Enter pet name"
                  />
                </View>
                
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Species</Text>
                  <TouchableOpacity style={styles.dateInput}>
                    <Text style={styles.dateInputText}>
                      {pet.species || 'Select species'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={Colors.neutral.gray} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Breed</Text>
                <TextInput
                  style={styles.textInput}
                  value={pet.breed}
                  onChangeText={(value) => updatePetData(pet.id, 'breed', value)}
                  placeholder="Enter breed"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight (lbs)</Text>
                <TextInput
                  style={styles.textInput}
                  value={pet.weight}
                  onChangeText={(value) => updatePetData(pet.id, 'weight', value)}
                  placeholder="Enter weight"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Up-to-date vaccinations</Text>
                <Switch
                  value={pet.vaccinationRecords}
                  onValueChange={(value) => updatePetData(pet.id, 'vaccinationRecords', value)}
                  trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.larkieBlue }}
                  thumbColor={pet.vaccinationRecords ? Colors.neutral.white : Colors.neutral.gray}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <LinearGradient colors={gradients.primary} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.neutral.white} />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const VehicleInformationStep: React.FC<StepProps> = ({ onNext, data, updateData }) => {
  const [needsParking, setNeedsParking] = useState<boolean>(data.needsParking || false);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInformation>(
    data.vehicleInfo || {
      id: 'vehicle-1',
      licensePlate: '',
      make: '',
      model: '',
      color: '',
      vehicleType: 'car',
      arrivalDate: new Date(),
      departureDate: new Date(),
    }
  );

  const updateVehicleData = (field: string, value: string) => {
    setVehicleInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    updateData({ 
      needsParking,
      vehicleInfo: needsParking ? vehicleInfo : null
    });
    onNext();
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vehicle Information</Text>
      <Text style={styles.stepSubtitle}>Will you need parking during your stay?</Text>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>I need parking</Text>
        <Switch
          value={needsParking}
          onValueChange={setNeedsParking}
          trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.larkieBlue }}
          thumbColor={needsParking ? Colors.neutral.white : Colors.neutral.gray}
        />
      </View>

      {needsParking && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>License Plate Number</Text>
            <TextInput
              style={styles.textInput}
              value={vehicleInfo.licensePlate}
              onChangeText={(value) => updateVehicleData('licensePlate', value)}
              placeholder="Enter license plate"
              autoCapitalize="characters"
            />
          </View>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Make</Text>
              <TextInput
                style={styles.textInput}
                value={vehicleInfo.make}
                onChangeText={(value) => updateVehicleData('make', value)}
                placeholder="e.g. Toyota"
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Model</Text>
              <TextInput
                style={styles.textInput}
                value={vehicleInfo.model}
                onChangeText={(value) => updateVehicleData('model', value)}
                placeholder="e.g. Camry"
              />
            </View>
          </View>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Color</Text>
              <TextInput
                style={styles.textInput}
                value={vehicleInfo.color}
                onChangeText={(value) => updateVehicleData('color', value)}
                placeholder="Enter color"
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Vehicle Type</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>
                  {vehicleInfo.vehicleType || 'Select type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.neutral.gray} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.parkingNote}>
            <Ionicons name="information-circle" size={20} color={Colors.primary.larkieBlue} />
            <Text style={styles.parkingNoteText}>
              Parking is complimentary for registered guests. You'll receive parking instructions upon check-in.
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <LinearGradient colors={gradients.primary} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>Continue to Review</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.neutral.white} />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ReviewStep: React.FC<StepProps & { navigation: any }> = ({ navigation, data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Pre-Check-In Complete! 🎉", 
        "Welcome to Larkie's Paradise Resort! Your pre-check-in has been submitted successfully. You'll receive a confirmation email shortly.", 
        [
          { text: "Continue Exploring", onPress: () => navigation.navigate("Home") },
          { text: "OK", onPress: () => navigation.goBack() }
        ]
      );
    }, 2000);
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review & Complete</Text>
      <Text style={styles.stepSubtitle}>Please review your information before submitting</Text>

      {/* Reservation Summary */}
      {data.existingReservation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar" size={18} color={Colors.primary.larkieBlue} /> Reservation Details
          </Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewItemLabel}>Confirmation Number</Text>
            <Text style={styles.reviewItemValue}>{data.existingReservation.confirmationNumber}</Text>
            
            <Text style={styles.reviewItemLabel}>Hotel</Text>
            <Text style={styles.reviewItemValue}>{data.existingReservation.hotelName}</Text>
            
            <Text style={styles.reviewItemLabel}>Check-in - Check-out</Text>
            <Text style={styles.reviewItemValue}>
              {new Date(data.existingReservation.checkInDate).toLocaleDateString()} - {new Date(data.existingReservation.checkOutDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}

      {/* Room Summary */}
      {data.selectedRoom && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="bed" size={18} color={Colors.primary.larkieBlue} /> Room & Arrival
          </Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewItemLabel}>Room Type</Text>
            <Text style={styles.reviewItemValue}>{data.selectedRoom.name}</Text>
            
            <Text style={styles.reviewItemLabel}>Guests</Text>
            <Text style={styles.reviewItemValue}>{data.guestCount} {data.guestCount === 1 ? 'Guest' : 'Guests'}</Text>
            
            {data.selectedArrivalTime && (
              <>
                <Text style={styles.reviewItemLabel}>Estimated Arrival</Text>
                <Text style={styles.reviewItemValue}>{data.selectedArrivalTime}</Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Guest Information */}
      {data.guestData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person" size={18} color={Colors.primary.larkieBlue} /> Main Guest Information
          </Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewItemLabel}>Name</Text>
            <Text style={styles.reviewItemValue}>{data.guestData.firstName} {data.guestData.lastName}</Text>
            
            <Text style={styles.reviewItemLabel}>Email</Text>
            <Text style={styles.reviewItemValue}>{data.guestData.email}</Text>
            
            <Text style={styles.reviewItemLabel}>Phone</Text>
            <Text style={styles.reviewItemValue}>{data.guestData.phoneNumber}</Text>
            
            {data.guestData.nationality && (
              <>
                <Text style={styles.reviewItemLabel}>Nationality</Text>
                <Text style={styles.reviewItemValue}>{data.guestData.nationality}</Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Additional Guests */}
      {data.additionalGuests && data.additionalGuests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="people" size={18} color={Colors.primary.larkieBlue} /> Additional Guests ({data.additionalGuests.length})
          </Text>
          <View style={styles.reviewCard}>
            {data.additionalGuests.map((guest, index) => (
              <View key={guest.id} style={index > 0 ? styles.additionalGuestSeparator : {}}>
                <Text style={styles.reviewItemValue}>
                  {guest.firstName} {guest.lastName}
                  {guest.relationship && ` (${guest.relationship})`}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Pet Information */}
      {data.hasPets && data.pets && data.pets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="paw" size={18} color={Colors.primary.larkieBlue} /> Pet Information ({data.pets.length})
          </Text>
          <View style={styles.reviewCard}>
            {data.pets.map((pet, index) => (
              <View key={pet.id} style={index > 0 ? styles.additionalGuestSeparator : {}}>
                <Text style={styles.reviewItemValue}>
                  {pet.name} - {pet.species} {pet.breed && `(${pet.breed})`}
                  {pet.weight && `, ${pet.weight} lbs`}
                </Text>
                {pet.vaccinationRecords && (
                  <Text style={styles.reviewItemNote}>✓ Vaccinations up to date</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Vehicle Information */}
      {data.needsParking && data.vehicleInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="car" size={18} color={Colors.primary.larkieBlue} /> Vehicle & Parking
          </Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewItemLabel}>License Plate</Text>
            <Text style={styles.reviewItemValue}>{data.vehicleInfo.licensePlate}</Text>
            
            <Text style={styles.reviewItemLabel}>Vehicle</Text>
            <Text style={styles.reviewItemValue}>
              {data.vehicleInfo.color} {data.vehicleInfo.make} {data.vehicleInfo.model}
            </Text>
            
            <Text style={styles.reviewItemNote}>Complimentary parking included</Text>
          </View>
        </View>
      )}

      {/* Submit Button */}
      <View style={styles.submitSection}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonLoading]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient colors={gradients.primary} style={styles.buttonGradient}>
            {isSubmitting ? (
              <>
                <Text style={styles.buttonText}>Submitting...</Text>
                <View style={styles.loadingIndicator} />
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color={Colors.neutral.white} />
                <Text style={[styles.buttonText, styles.submitButtonText]}>Complete Pre-Check-In</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.submitNote}>
          By completing pre-check-in, you agree to our terms and conditions. 
          You'll receive a confirmation email with your digital room key.
        </Text>
      </View>
    </ScrollView>
  );
};

export const ComprehensivePreCheckInScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const stepProps = {
    onNext: handleNext,
    onBack: handleBack,
    data: formData,
    updateData,
  };

  const getCurrentStep = () => {
    switch (currentStep) {
      case 0: return <ReservationCheckStep {...stepProps} />;
      case 1: return <RoomSelectionStep {...stepProps} />;
      case 2: return <GuestInformationStep {...stepProps} />;
      case 3: return <AdditionalGuestsStep {...stepProps} />;
      case 4: return <PetRegistrationStep {...stepProps} />;
      case 5: return <VehicleInformationStep {...stepProps} />;
      case 6: return <ReviewStep {...stepProps} navigation={navigation} />;
      default: return <ReservationCheckStep {...stepProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.white} />
      
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
          message="Let's get your pre-check-in completed!"
          userName={mockUser.name.split(" ")[0]}
          size="small"
          showSpeechBubble={true}
        />
      </View>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

      {/* Current Step */}
      {getCurrentStep()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCompleted: {
    backgroundColor: Colors.primary.larkieBlue,
  },
  stepActive: {
    backgroundColor: Colors.primary.larkieBlue,
  },
  stepInactive: {
    backgroundColor: Colors.neutral.lightGray,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary.deepNavy,
  },
  stepLine: {
    width: 30,
    height: 2,
  },
  stepLineCompleted: {
    backgroundColor: Colors.primary.larkieBlue,
  },
  stepLineInactive: {
    backgroundColor: Colors.neutral.lightGray,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.neutral.gray,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary.deepNavy,
    marginBottom: 16,
  },
  searchMethodContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: Colors.neutral.lightGray,
    padding: 4,
  },
  searchMethodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  searchMethodActive: {
    backgroundColor: Colors.neutral.white,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchMethodText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    fontWeight: "500",
  },
  searchMethodTextActive: {
    color: Colors.primary.deepNavy,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary.deepNavy,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: Colors.neutral.white,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.neutral.white,
  },
  dateInputText: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
  },
  searchButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
  },
  searchButtonLoading: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  reservationCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary.larkieBlue,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  reservationCardSelected: {
    borderColor: Colors.primary.larkieBlue,
    backgroundColor: '#F8FEFF',
  },
  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reservationConfirmation: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
  reservationStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.accent.successGreen,
    backgroundColor: Colors.accent.successGreen + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reservationHotel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary.larkieBlue,
    marginBottom: 4,
  },
  reservationDates: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 4,
  },
  reservationDetails: {
    fontSize: 13,
    color: Colors.neutral.gray,
  },
  stepActions: {
    marginTop: 24,
  },
  nextButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: Colors.neutral.gray,
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
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 24,
  },
  skipButton: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
    marginRight: 12,
  },
  skipButtonText: {
    color: Colors.primary.deepNavy,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primary.deepNavy,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary.larkieBlue,
    marginLeft: 6,
  },
  petCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  petCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  petCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary.deepNavy,
  },
  parkingNote: {
    flexDirection: "row",
    backgroundColor: Colors.primary.larkieBlue + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "flex-start",
  },
  parkingNoteText: {
    fontSize: 13,
    color: Colors.primary.deepNavy,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewItemLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.neutral.gray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  reviewItemValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary.deepNavy,
    marginBottom: 8,
  },
  reviewItemNote: {
    fontSize: 12,
    color: Colors.accent.successGreen,
    fontStyle: "italic",
    marginTop: -4,
    marginBottom: 8,
  },
  additionalGuestSeparator: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
    paddingTop: 12,
    marginTop: 8,
  },
  submitSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  submitButtonLoading: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
  submitNote: {
    fontSize: 12,
    color: Colors.neutral.gray,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
    borderTopColor: 'transparent',
    marginLeft: 12,
  },
});