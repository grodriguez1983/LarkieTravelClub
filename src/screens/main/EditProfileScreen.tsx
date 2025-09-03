import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, gradients } from '../../constants/colors';
import { NavigationProps, User } from '../../types';
import { StorageService } from '../../services/storage';
import { updateUserProfile } from '../../services/mockData';

export const EditProfileScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    nationality: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUser();
      if (userData) {
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          occupation: userData.occupation || '',
          nationality: userData.nationality || '',
          dateOfBirth: userData.dateOfBirth || '',
          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            state: userData.address?.state || '',
            country: userData.address?.country || '',
            zipCode: userData.address?.zipCode || '',
          },
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    setLoading(true);
    try {
      // Update user profile through mock service
      const updatedUser = await updateUserProfile(formData);
      
      // Save to local storage
      await StorageService.saveUser(updatedUser);
      
      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string, addressField?: string) => {
    if (addressField) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[addressField || field]) {
      setErrors(prev => ({
        ...prev,
        [addressField || field]: '',
      }));
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: any = 'default',
    errorKey?: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          errors[errorKey || label.toLowerCase()] && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.neutral.gray}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
      {errors[errorKey || label.toLowerCase()] && (
        <Text style={styles.errorText}>{errors[errorKey || label.toLowerCase()]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.deepNavy} />
      
      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Profile</Text>
        
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={loading}
        >
          <Text style={[styles.saveButtonText, loading && styles.saveButtonDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Personal Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.card}>
                {renderInputField(
                  'Full Name',
                  formData.name,
                  (text) => updateFormData('name', text),
                  'Enter your full name',
                  'default',
                  'name'
                )}
                
                {renderInputField(
                  'Email Address',
                  formData.email,
                  (text) => updateFormData('email', text),
                  'Enter your email address',
                  'email-address',
                  'email'
                )}
                
                {renderInputField(
                  'Phone Number',
                  formData.phone,
                  (text) => updateFormData('phone', text),
                  'Enter your phone number',
                  'phone-pad',
                  'phone'
                )}
                
                {renderInputField(
                  'Occupation',
                  formData.occupation,
                  (text) => updateFormData('occupation', text),
                  'Enter your occupation'
                )}
                
                {renderInputField(
                  'Nationality',
                  formData.nationality,
                  (text) => updateFormData('nationality', text),
                  'Enter your nationality'
                )}
                
                {renderInputField(
                  'Date of Birth',
                  formData.dateOfBirth,
                  (text) => updateFormData('dateOfBirth', text),
                  'MM/DD/YYYY'
                )}
              </View>
            </View>

            {/* Address Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address Information</Text>
              <View style={styles.card}>
                {renderInputField(
                  'Street Address',
                  formData.address.street,
                  (text) => updateFormData('address', text, 'street'),
                  'Enter your street address'
                )}
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    {renderInputField(
                      'City',
                      formData.address.city,
                      (text) => updateFormData('address', text, 'city'),
                      'City'
                    )}
                  </View>
                  <View style={styles.halfWidth}>
                    {renderInputField(
                      'State/Province',
                      formData.address.state,
                      (text) => updateFormData('address', text, 'state'),
                      'State'
                    )}
                  </View>
                </View>
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    {renderInputField(
                      'Country',
                      formData.address.country,
                      (text) => updateFormData('address', text, 'country'),
                      'Country'
                    )}
                  </View>
                  <View style={styles.halfWidth}>
                    {renderInputField(
                      'ZIP Code',
                      formData.address.zipCode,
                      (text) => updateFormData('address', text, 'zipCode'),
                      'ZIP Code'
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButtonLarge, loading && styles.saveButtonLargeDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonLargeText}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.deepNavy,
    marginBottom: 15,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.deepNavy,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.primary.deepNavy,
    backgroundColor: Colors.neutral.white,
  },
  inputError: {
    borderColor: Colors.accent.errorRed,
  },
  errorText: {
    fontSize: 12,
    color: Colors.accent.errorRed,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    paddingVertical: 15,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.gray,
  },
  saveButtonLarge: {
    flex: 1,
    backgroundColor: Colors.primary.larkieBlue,
    borderRadius: 12,
    paddingVertical: 15,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonLargeDisabled: {
    opacity: 0.5,
  },
  saveButtonLargeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
});