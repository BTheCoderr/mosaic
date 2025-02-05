import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../theme/ThemeProvider';

interface FeedbackFormData {
  rating: number;
  videoQuality: number;
  audioQuality: number;
  comments: string;
  reportIssue?: string;
}

const VerificationFeedbackScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { matchId, userName } = route.params as { matchId: string; userName: string };

  const [feedback, setFeedback] = useState<FeedbackFormData>({
    rating: 0,
    videoQuality: 0,
    audioQuality: 0,
    comments: '',
  });

  const renderStars = (value: number, onChange: (rating: number) => void) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          style={styles.starButton}
        >
          <Icon
            name={star <= value ? 'star' : 'star-outline'}
            size={32}
            color={star <= value ? colors.primary.main : colors.gray[300]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      Alert.alert(
        'Thank You',
        'Your feedback has been submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ChatList'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Issue',
      'What type of issue would you like to report?',
      [
        {
          text: 'Inappropriate Behavior',
          onPress: () => setFeedback({ ...feedback, reportIssue: 'inappropriate_behavior' }),
        },
        {
          text: 'Technical Problems',
          onPress: () => setFeedback({ ...feedback, reportIssue: 'technical_problems' }),
        },
        {
          text: 'Identity Concerns',
          onPress: () => setFeedback({ ...feedback, reportIssue: 'identity_concerns' }),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.light }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        How was your verification call?
      </Text>

      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        Rate your experience with {userName}
      </Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text.primary }]}>Overall Experience</Text>
        {renderStars(feedback.rating, (rating) => setFeedback({ ...feedback, rating }))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text.primary }]}>Video Quality</Text>
        {renderStars(feedback.videoQuality, (rating) =>
          setFeedback({ ...feedback, videoQuality: rating })
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text.primary }]}>Audio Quality</Text>
        {renderStars(feedback.audioQuality, (rating) =>
          setFeedback({ ...feedback, audioQuality: rating })
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text.primary }]}>Comments</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background.surface,
              color: colors.text.primary,
              borderColor: colors.gray[300],
            },
          ]}
          placeholder="Share your thoughts about the verification experience..."
          placeholderTextColor={colors.text.secondary}
          multiline
          numberOfLines={4}
          value={feedback.comments}
          onChangeText={(text) => setFeedback({ ...feedback, comments: text })}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary.main }]}
        onPress={handleSubmit}
      >
        <Text style={[styles.buttonText, { color: colors.common.white }]}>
          Submit Feedback
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reportButton, { borderColor: colors.status.error }]}
        onPress={handleReport}
      >
        <Text style={[styles.reportButtonText, { color: colors.status.error }]}>
          Report an Issue
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerificationFeedbackScreen; 