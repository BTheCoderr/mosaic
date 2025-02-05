import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { updateUser } from '../../../store/slices/authSlice';
import * as ImagePicker from 'react-native-image-picker';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors, spacing } = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const [firstName, setFirstName] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImagePick = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }

        if (response.assets && response.assets[0].uri) {
          setProfileImage(response.assets[0].uri);
        }
      }
    );
  };

  const handleSave = async () => {
    try {
      // Here you would typically upload the image first if changed
      // Then update the user profile
      dispatch(
        updateUser({
          username: firstName,
          // Add other fields as needed
        })
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.light }]}>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={handleImagePick} style={styles.imageWrapper}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View
              style={[styles.imagePlaceholder, { backgroundColor: colors.gray[200] }]}
            >
              <Icon name="camera" size={40} color={colors.gray[400]} />
            </View>
          )}
          <View
            style={[
              styles.editBadge,
              { backgroundColor: colors.primary.main },
            ]}
          >
            <Icon name="pencil" size={16} color={colors.common.white} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>
            Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.gray[300],
                color: colors.text.primary,
              },
            ]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Your name"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>
            Bio
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.bioInput,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.gray[300],
                color: colors.text.primary,
              },
            ]}
            value={bio}
            onChangeText={setBio}
            placeholder="Write something about yourself"
            placeholderTextColor={colors.text.secondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary.main }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: colors.common.white }]}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  bioInput: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen; 