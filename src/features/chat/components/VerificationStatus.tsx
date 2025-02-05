import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../theme/ThemeProvider';
import { VerificationStatus as VerificationStatusType } from '../../../models/Match';

interface Props {
  status: VerificationStatusType;
  matchId: string;
  userName: string;
  scheduledTime?: Date;
}

const VerificationStatus: React.FC<Props> = ({
  status,
  matchId,
  userName,
  scheduledTime,
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'not_started':
        return {
          icon: 'videocam-outline',
          text: 'Schedule Video Verification',
          color: colors.status.warning,
          action: () =>
            navigation.navigate('ScheduleVerification', { matchId, userName }),
        };
      case 'scheduled':
        return {
          icon: 'time-outline',
          text: `Scheduled for ${new Date(scheduledTime!).toLocaleString()}`,
          color: colors.status.info,
          action: () =>
            navigation.navigate('ScheduleVerification', { matchId, userName }),
        };
      case 'completed':
        return {
          icon: 'checkmark-circle-outline',
          text: 'Verified',
          color: colors.status.success,
        };
      case 'failed':
        return {
          icon: 'close-circle-outline',
          text: 'Verification Failed',
          color: colors.status.error,
          action: () =>
            navigation.navigate('ScheduleVerification', { matchId, userName }),
        };
      case 'skipped':
        return {
          icon: 'alert-circle-outline',
          text: 'Verification Skipped',
          color: colors.status.warning,
          action: () =>
            navigation.navigate('ScheduleVerification', { matchId, userName }),
        };
      default:
        return {
          icon: 'help-circle-outline',
          text: 'Unknown Status',
          color: colors.gray[500],
        };
    }
  };

  const config = getStatusConfig();

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: config.color }]}
      onPress={config.action}
      disabled={!config.action}
    >
      <Icon name={config.icon} size={20} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
      {config.action && (
        <Icon name="chevron-forward" size={20} color={config.color} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 4,
  },
  text: {
    fontSize: 14,
    marginHorizontal: 8,
    flex: 1,
  },
});

export default VerificationStatus; 