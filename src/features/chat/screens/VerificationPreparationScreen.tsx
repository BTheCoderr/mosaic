import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../theme/ThemeProvider';

const VERIFICATION_TIPS = [
  {
    icon: 'sunny-outline',
    title: 'Good Lighting',
    description: 'Find a well-lit area, preferably with natural light facing you.',
  },
  {
    icon: 'wifi-outline',
    title: 'Stable Connection',
    description: 'Ensure you have a strong internet connection for the best experience.',
  },
  {
    icon: 'mic-outline',
    title: 'Clear Audio',
    description: 'Choose a quiet location and test your microphone.',
  },
  {
    icon: 'camera-outline',
    title: 'Camera Position',
    description: 'Position your camera at eye level and ensure your face is clearly visible.',
  },
  {
    icon: 'time-outline',
    title: 'Be On Time',
    description: 'Join the verification call a few minutes early.',
  },
  {
    icon: 'id-card-outline',
    title: 'Have ID Ready',
    description: 'Keep your ID nearby in case additional verification is needed.',
  },
];

const VerificationPreparationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, spacing } = useTheme();
  const { matchId, userName, scheduledTime } = route.params as {
    matchId: string;
    userName: string;
    scheduledTime: string;
  };

  const handleStartVerification = () => {
    navigation.navigate('VideoVerification', {
      matchId,
      userName,
    });
  };

  const renderTip = ({ icon, title, description }: typeof VERIFICATION_TIPS[0]) => (
    <View
      style={[
        styles.tipContainer,
        { backgroundColor: colors.background.surface, borderColor: colors.gray[200] },
      ]}
      key={title}
    >
      <Icon name={icon} size={32} color={colors.primary.main} />
      <View style={styles.tipContent}>
        <Text style={[styles.tipTitle, { color: colors.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.tipDescription, { color: colors.text.secondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.light }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Prepare for Video Verification
        </Text>

        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Your verification call with {userName} is scheduled for{' '}
          {new Date(scheduledTime).toLocaleString()}
        </Text>

        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../../assets/images/video-verification.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Tips for a Successful Verification
        </Text>

        {VERIFICATION_TIPS.map(renderTip)}

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.primary.main }]}
          onPress={handleStartVerification}
        >
          <Text style={[styles.startButtonText, { color: colors.common.white }]}>
            Start Verification
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  illustration: {
    width: 200,
    height: 200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  tipContent: {
    marginLeft: 16,
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
  },
  startButton: {
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VerificationPreparationScreen; 