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
import { NavigationProps, PreCheckInStep, GuestPersonalData, AdditionalGuest, PetRegistration, VehicleInformation, RoomPreference } from "../../types";
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
  calculatePreCheckInFees
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

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Room Selection</Text>
      <Text style={styles.stepSubtitle}>Where will you be staying with us?</Text>

      {/* Guest Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number of Guests</Text>
        <View style={styles.guestCountContainer}>
          <TouchableOpacity 
            style={styles.guestButton}
            onPress={() => guestCount > 1 && setGuestCount(guestCount - 1)}
          >
            <Ionicons name="remove" size={20} color={Colors.primary.deepNavy} />
          </TouchableOpacity>
          <Text style={styles.guestCount}>{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</Text>
          <TouchableOpacity 
            style={styles.guestButton}
            onPress={() => guestCount < 4 && setGuestCount(guestCount + 1)}
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
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomPrice}>{room.priceRange}</Text>
              </View>
              {selectedRoom?.id === room.id && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary.larkieBlue} />
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
          </TouchableOpacity>
        ))}
      </View>

      {/* Arrival Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estimated Arrival Time</Text>
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

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <LinearGradient
          colors={gradients.primary}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Continue to Guest Information</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.neutral.white} />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const GuestInformationStep: React.FC<StepProps> = ({ onNext, onBack, data, updateData }) => {
  const [guestData, setGuestData] = useState<GuestPersonalData>(data.mainGuest || mockMainGuest);
  const [documentUploading, setDocumentUploading] = useState(false);

  const simulateDocumentUpload = async () => {
    setDocumentUploading(true);
    try {
      const ocrResult = await simulateDocumentOCR(guestData.document.type);
      setGuestData(prev => ({
        ...prev,
        fullName: ocrResult.extractedName.replace(',', '').split(' ').reverse().join(' '),
        dateOfBirth: ocrResult.extractedDateOfBirth,
        document: {
          ...prev.document,
          number: ocrResult.extractedNumber,
          ocrData: ocrResult,
          verified: true,
          imageUrl: 'mock://uploaded-document.jpg'
        }
      }));
      Alert.alert(
        "Document Processed! ✅", 
        `OCR confidence: ${Math.round(ocrResult.confidence * 100)}%\nData extracted successfully!`
      );
    } catch (error) {
      Alert.alert("Upload Failed", "Please try again.");
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleNext = () => {
    updateData({ mainGuest: guestData });
    onNext();
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Guest Information</Text>
      <Text style={styles.stepSubtitle}>Please provide your personal details</Text>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.textInput}
            value={guestData.fullName}
            onChangeText={(text) => setGuestData(prev => ({ ...prev, fullName: text }))}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Occupation *</Text>
          <TextInput
            style={styles.textInput}
            value={guestData.occupation}
            onChangeText={(text) => setGuestData(prev => ({ ...prev, occupation: text }))}
            placeholder="Your occupation"
          />
        </View>
      </View>

      {/* Document Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identification Document</Text>
        
        <View style={styles.documentUploadCard}>
          <View style={styles.documentHeader}>
            <Ionicons name="document-text" size={24} color={Colors.primary.larkieBlue} />
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>{guestData.document.type}</Text>
              <Text style={styles.documentSubtitle}>
                {guestData.document.verified ? 
                  `✅ Verified • ${guestData.document.number}` : 
                  'Upload required'
                }
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.uploadButton, documentUploading && styles.uploadButtonLoading]}
            onPress={simulateDocumentUpload}
            disabled={documentUploading}
          >
            <Ionicons 
              name={documentUploading ? "hourglass" : guestData.document.verified ? "checkmark-circle" : "camera"} 
              size={20} 
              color={Colors.neutral.white} 
            />
            <Text style={styles.uploadButtonText}>
              {documentUploading ? "Processing..." : guestData.document.verified ? "Re-upload" : "Upload & Scan"}
            </Text>
          </TouchableOpacity>

          {guestData.document.ocrData && (
            <View style={styles.ocrResults}>
              <Text style={styles.ocrTitle}>✨ OCR Results:</Text>
              <Text style={styles.ocrText}>Name: {guestData.document.ocrData.extractedName}</Text>
              <Text style={styles.ocrText}>Number: {guestData.document.ocrData.extractedNumber}</Text>
              <Text style={styles.ocrText}>Confidence: {Math.round(guestData.document.ocrData.confidence * 100)}%</Text>
            </View>
          )}
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Contact Name *</Text>
          <TextInput
            style={styles.textInput}
            value={guestData.emergencyContact.name}
            onChangeText={(text) => setGuestData(prev => ({ 
              ...prev, 
              emergencyContact: { ...prev.emergencyContact, name: text }
            }))}
            placeholder="Emergency contact name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.textInput}
            value={guestData.emergencyContact.phoneNumber}
            onChangeText={(text) => setGuestData(prev => ({ 
              ...prev, 
              emergencyContact: { ...prev.emergencyContact, phoneNumber: text }
            }))}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient colors={gradients.primary} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.neutral.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const AdditionalGuestsStep: React.FC<StepProps> = ({ onNext, onBack, data, updateData }) => {
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>(data.additionalGuests || []);
  const mainGuestCount = data.guestCount || 2;
  const availableSlots = Math.max(0, mainGuestCount - 1);

  const handleNext = () => {
    updateData({ additionalGuests });
    onNext();
  };

  const addGuest = () => {
    if (additionalGuests.length < availableSlots) {
      setAdditionalGuests(prev => [...prev, mockAdditionalGuests[prev.length] || mockAdditionalGuests[0]]);
    }
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Additional Guests</Text>
      <Text style={styles.stepSubtitle}>
        Add information for {availableSlots} additional guest{availableSlots !== 1 ? 's' : ''}
      </Text>

      {additionalGuests.map((guest, index) => (
        <View key={index} style={styles.guestCard}>
          <View style={styles.guestCardHeader}>
            <Text style={styles.guestCardTitle}>Guest {index + 2}</Text>
            <Text style={styles.guestCardRelation}>{guest.relationshipToMainGuest}</Text>
          </View>
          
          <Text style={styles.guestCardName}>{guest.personalData.fullName}</Text>
          <Text style={styles.guestCardDetails}>
            {guest.personalData.document.type} • {guest.personalData.document.number}
          </Text>
          
          {guest.isMinor && (
            <View style={styles.minorBadge}>
              <Text style={styles.minorBadgeText}>Minor • Parental Auth. ✅</Text>
            </View>
          )}
        </View>
      ))}

      {additionalGuests.length < availableSlots && (
        <TouchableOpacity style={styles.addGuestButton} onPress={addGuest}>
          <Ionicons name="add-circle" size={24} color={Colors.primary.larkieBlue} />
          <Text style={styles.addGuestText}>Add Guest {additionalGuests.length + 2}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient colors={gradients.primary} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.neutral.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const PetRegistrationStep: React.FC<StepProps> = ({ onNext, onBack, data, updateData }) => {
  const [pets, setPets] = useState<PetRegistration[]>(data.pets || []);
  const [hasPets, setHasPets] = useState(pets.length > 0);

  const handleNext = () => {
    updateData({ pets: hasPets ? pets : [] });
    onNext();
  };

  const addPet = () => {
    setPets(prev => [...prev, mockPets[0]]);
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Pet Registration</Text>
      <Text style={styles.stepSubtitle}>Will you be traveling with pets?</Text>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Traveling with pets</Text>
        <Switch
          value={hasPets}
          onValueChange={(value) => {
            setHasPets(value);
            if (!value) setPets([]);
          }}
          trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.larkieBlue }}
        />
      </View>

      {hasPets && (
        <>
          {pets.map((pet, index) => (
            <View key={index} style={styles.petCard}>
              <View style={styles.petCardHeader}>
                <Ionicons name="paw" size={24} color={Colors.primary.larkieBlue} />
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petDetails}>
                    {pet.species} • {pet.breed} • {pet.age} years old
                  </Text>
                </View>
                <Text style={styles.petFee}>${pet.petFee}</Text>
              </View>

              <View style={styles.petCertificates}>
                {pet.vetCertificates.map((cert, certIndex) => (
                  <View key={certIndex} style={styles.certificateItem}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.accent.successGreen} />
                    <Text style={styles.certificateText}>{cert.type} ✅</Text>
                  </View>
                ))}
              </View>

              {pet.dietaryRestrictions.length > 0 && (
                <View style={styles.dietaryInfo}>
                  <Text style={styles.dietaryTitle}>Dietary Restrictions:</Text>
                  <Text style={styles.dietaryText}>{pet.dietaryRestrictions.join(', ')}</Text>
                </View>
              )}
            </View>
          ))}

          {pets.length === 0 && (
            <TouchableOpacity style={styles.addPetButton} onPress={addPet}>
              <Ionicons name="add-circle" size={24} color={Colors.primary.larkieBlue} />
              <Text style={styles.addPetText}>Add Your Pet</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient colors={gradients.primary} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.neutral.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const VehicleInformationStep: React.FC<StepProps> = ({ onNext, onBack, data, updateData }) => {
  const [hasVehicle, setHasVehicle] = useState(!!data.vehicle);
  const [vehicle, setVehicle] = useState<VehicleInformation | undefined>(data.vehicle);

  const handleNext = () => {
    updateData({ vehicle: hasVehicle ? vehicle : undefined });
    onNext();
  };

  const addVehicle = () => {
    setVehicle(mockVehicle);
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vehicle Information</Text>
      <Text style={styles.stepSubtitle}>Will you need parking during your stay?</Text>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>I have a vehicle</Text>
        <Switch
          value={hasVehicle}
          onValueChange={(value) => {
            setHasVehicle(value);
            if (!value) setVehicle(undefined);
          }}
          trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.larkieBlue }}
        />
      </View>

      {hasVehicle && (
        <>
          {vehicle ? (
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleCardHeader}>
                <Ionicons name="car" size={24} color={Colors.primary.larkieBlue} />
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Text>
                  <Text style={styles.vehicleDetails}>
                    {vehicle.color} • {vehicle.licensePlate} • {vehicle.type}
                  </Text>
                </View>
              </View>

              {vehicle.specialNeeds.length > 0 && (
                <View style={styles.specialNeeds}>
                  <Text style={styles.specialNeedsTitle}>Special Requirements:</Text>
                  <Text style={styles.specialNeedsText}>{vehicle.specialNeeds.join(', ')}</Text>
                </View>
              )}

              {vehicle.parkingReservation && (
                <View style={styles.parkingInfo}>
                  <Text style={styles.parkingTitle}>Parking Reservation:</Text>
                  <Text style={styles.parkingDetails}>
                    Space {vehicle.parkingReservation.spaceNumber} • {vehicle.parkingReservation.level}
                  </Text>
                  <Text style={styles.parkingFee}>
                    ${vehicle.parkingReservation.dailyRate}/night • Total: ${vehicle.parkingReservation.totalFee}
                  </Text>
                  {vehicle.parkingReservation.hasElectricCharging && (
                    <Text style={styles.parkingFeature}>⚡ Electric Charging Available</Text>
                  )}
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.addVehicleButton} onPress={addVehicle}>
              <Ionicons name="add-circle" size={24} color={Colors.primary.larkieBlue} />
              <Text style={styles.addVehicleText}>Add Your Vehicle</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient colors={gradients.primary} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Review & Complete</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.neutral.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const ReviewStep: React.FC<StepProps> = ({ onBack, data, navigation }: StepProps & { navigation: any }) => {
  const [loading, setLoading] = useState(false);
  
  const fees = calculatePreCheckInFees(data.pets || [], data.vehicle);
  
  const handleComplete = async () => {
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Pre-Check-In Complete! 🎉",
        "Welcome to Larkie's Travel Club! Your room will be ready upon arrival.",
        [
          {
            text: "Continue Exploring",
            onPress: () => navigation.navigate("Home")
          }
        ]
      );
    }, 2000);
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review & Complete</Text>
      <Text style={styles.stepSubtitle}>Please review your information before submitting</Text>

      {/* Room Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>🏨 Room Selection</Text>
        <Text style={styles.summaryText}>{data.selectedRoom?.name}</Text>
        <Text style={styles.summarySubtext}>
          {data.guestCount} guest{data.guestCount !== 1 ? 's' : ''} • Arriving {data.selectedArrivalTime}
        </Text>
      </View>

      {/* Guest Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>👤 Main Guest</Text>
        <Text style={styles.summaryText}>{data.mainGuest?.fullName}</Text>
        <Text style={styles.summarySubtext}>
          {data.mainGuest?.document.type} verified ✅
        </Text>
      </View>

      {/* Additional Guests */}
      {data.additionalGuests?.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>👥 Additional Guests ({data.additionalGuests.length})</Text>
          {data.additionalGuests.map((guest: AdditionalGuest, index: number) => (
            <Text key={index} style={styles.summaryText}>
              {guest.personalData.fullName} ({guest.relationshipToMainGuest})
            </Text>
          ))}
        </View>
      )}

      {/* Pets */}
      {data.pets?.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🐾 Pets ({data.pets.length})</Text>
          {data.pets.map((pet: PetRegistration, index: number) => (
            <Text key={index} style={styles.summaryText}>
              {pet.name} - {pet.species} (+${pet.petFee})
            </Text>
          ))}
        </View>
      )}

      {/* Vehicle */}
      {data.vehicle && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🚗 Vehicle & Parking</Text>
          <Text style={styles.summaryText}>
            {data.vehicle.year} {data.vehicle.make} {data.vehicle.model}
          </Text>
          <Text style={styles.summarySubtext}>
            ${data.vehicle.parkingReservation?.totalFee} parking fee
          </Text>
        </View>
      )}

      {/* Additional Fees */}
      {fees.total > 0 && (
        <View style={styles.feesCard}>
          <Text style={styles.feesTitle}>💰 Additional Fees</Text>
          {fees.petFees > 0 && (
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Pet fees</Text>
              <Text style={styles.feeAmount}>${fees.petFees}</Text>
            </View>
          )}
          {fees.parkingFees > 0 && (
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Parking fees</Text>
              <Text style={styles.feeAmount}>${fees.parkingFees}</Text>
            </View>
          )}
          <View style={styles.feeTotalRow}>
            <Text style={styles.feeTotalLabel}>Total Additional</Text>
            <Text style={styles.feeTotalAmount}>${fees.total}</Text>
          </View>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.completeButton, loading && styles.completeButtonLoading]} 
          onPress={handleComplete}
          disabled={loading}
        >
          <LinearGradient colors={gradients.primary} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>
              {loading ? "Processing..." : "Complete Check-In"}
            </Text>
            {!loading && <Ionicons name="checkmark-circle" size={20} color={Colors.neutral.white} />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export const ComprehensivePreCheckInScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const steps = [
    'Room Selection',
    'Guest Info',
    'Additional Guests',
    'Pets',
    'Vehicle',
    'Review'
  ];

  const updateData = (newData: any) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    const stepProps = {
      onNext: nextStep,
      onBack: previousStep,
      data: formData,
      updateData,
    };

    switch (currentStep) {
      case 0: return <RoomSelectionStep {...stepProps} />;
      case 1: return <GuestInformationStep {...stepProps} />;
      case 2: return <AdditionalGuestsStep {...stepProps} />;
      case 3: return <PetRegistrationStep {...stepProps} />;
      case 4: return <VehicleInformationStep {...stepProps} />;
      case 5: return <ReviewStep {...stepProps} navigation={navigation} />;
      default: return <RoomSelectionStep {...stepProps} />;
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

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Pre-Check-In</Text>
          <Text style={styles.headerSubtitle}>Step {currentStep + 1} of {steps.length}: {steps[currentStep]}</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={steps.length} />

      {/* Step Content */}
      {renderStep()}
    </SafeAreaView>
  );
};

// Extensive styles for the comprehensive pre-check-in...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  stepCompleted: {
    backgroundColor: Colors.accent.successGreen,
  },
  stepActive: {
    backgroundColor: Colors.primary.larkieBlue,
  },
  stepInactive: {
    backgroundColor: Colors.neutral.lightGray,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
  stepLine: {
    width: 30,
    height: 2,
  },
  stepLineCompleted: {
    backgroundColor: Colors.accent.successGreen,
  },
  stepLineInactive: {
    backgroundColor: Colors.neutral.lightGray,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 12,
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
  },
  roomDescription: {
    fontSize: 14,
    color: Colors.neutral.gray,
    lineHeight: 20,
    marginBottom: 8,
  },
  larkieRecommendation: {
    flexDirection: "row",
    backgroundColor: '#E8F5FF',
    padding: 10,
    borderRadius: 8,
    alignItems: "flex-start",
  },
  larkieRecommendationText: {
    fontSize: 12,
    color: Colors.primary.deepNavy,
    fontStyle: "italic",
    marginLeft: 6,
    flex: 1,
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary.deepNavy,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.primary.deepNavy,
    backgroundColor: Colors.neutral.white,
  },
  documentUploadCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  documentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
  documentSubtitle: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary.larkieBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadButtonLoading: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  ocrResults: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.larkieBlue,
  },
  ocrTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 8,
  },
  ocrText: {
    fontSize: 12,
    color: Colors.primary.deepNavy,
    marginBottom: 2,
  },
  guestCard: {
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
  guestCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  guestCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
  guestCardRelation: {
    fontSize: 12,
    color: Colors.primary.larkieBlue,
    fontWeight: "600",
  },
  guestCardName: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    marginBottom: 4,
  },
  guestCardDetails: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  minorBadge: {
    backgroundColor: Colors.accent.successGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  minorBadgeText: {
    fontSize: 12,
    color: Colors.neutral.white,
    fontWeight: "600",
  },
  addGuestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.neutral.lightGray,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addGuestText: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    marginLeft: 8,
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 12,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    fontWeight: "600",
  },
  petCard: {
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
  petCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
  petDetails: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  petFee: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.accent.successGreen,
  },
  petCertificates: {
    marginBottom: 12,
  },
  certificateItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  certificateText: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
    marginLeft: 8,
  },
  dietaryInfo: {
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
  },
  dietaryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 4,
  },
  dietaryText: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
  },
  addPetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.neutral.lightGray,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addPetText: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    marginLeft: 8,
    fontWeight: "600",
  },
  vehicleCard: {
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
  vehicleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
  },
  vehicleDetails: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  specialNeeds: {
    marginBottom: 12,
  },
  specialNeedsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 4,
  },
  specialNeedsText: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
  },
  parkingInfo: {
    backgroundColor: '#E8F5FF',
    padding: 12,
    borderRadius: 8,
  },
  parkingTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 4,
  },
  parkingDetails: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
    marginBottom: 2,
  },
  parkingFee: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
    marginBottom: 4,
  },
  parkingFeature: {
    fontSize: 14,
    color: Colors.accent.successGreen,
    fontWeight: "600",
  },
  addVehicleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.neutral.lightGray,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addVehicleText: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    marginLeft: 8,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  feesCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.successGreen,
  },
  feesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary.deepNavy,
    marginBottom: 12,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
  },
  feeAmount: {
    fontSize: 14,
    color: Colors.primary.deepNavy,
    fontWeight: "600",
  },
  feeTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
    paddingTop: 8,
    marginTop: 8,
  },
  feeTotalLabel: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    fontWeight: "bold",
  },
  feeTotalAmount: {
    fontSize: 16,
    color: Colors.accent.successGreen,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  backButton: {
    backgroundColor: Colors.neutral.lightGray,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    flex: 0.3,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary.deepNavy,
    fontWeight: "600",
  },
  nextButton: {
    flex: 0.65,
    borderRadius: 12,
    overflow: "hidden",
  },
  completeButton: {
    flex: 0.65,
    borderRadius: 12,
    overflow: "hidden",
  },
  completeButtonLoading: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});