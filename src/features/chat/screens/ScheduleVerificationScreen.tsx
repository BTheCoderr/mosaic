import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../../theme/ThemeProvider';
import { useAppSelector } from '../../../store/store';
import Icon from 'react-native-vector-icons/Ionicons';

const ScheduleVerificationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { matchId, userName } = route.params as { matchId: string; userName: string };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Get available time slots (in a real app, these would come from the backend)
  const getAvailableTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const startHour = now.getHours() + 1;
    
    for (let hour = startHour; hour < 23; hour++) {
      slots.push(new Date(selectedDate.setHours(hour, 0, 0, 0)));
      slots.push(new Date(selectedDate.setHours(hour, 30, 0, 0)));
    }
    
    return slots;
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSchedule = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/verify/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledTime: selectedDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule verification');
      }

      Alert.alert(
        'Verification Scheduled',
        `Your video verification with ${userName} has been scheduled for ${selectedDate.toLocaleString()}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule verification. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.light }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Schedule Video Verification
        </Text>

        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Choose a date and time for your video verification call with {userName}
        </Text>

        {/* Date Selection */}
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: colors.gray[100] }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar-outline" size={24} color={colors.text.primary} />
          <Text style={[styles.dateText, { color: colors.text.primary }]}>
            {selectedDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {/* Time Selection */}
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: colors.gray[100] }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Icon name="time-outline" size={24} color={colors.text.primary} />
          <Text style={[styles.dateText, { color: colors.text.primary }]}>
            {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
            maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // 7 days from now
          />
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            minuteInterval={30}
          />
        )}

        {/* Available Time Slots */}
        <View style={styles.slotsContainer}>
          <Text style={[styles.slotsTitle, { color: colors.text.primary }]}>
            Available Time Slots
          </Text>
          {getAvailableTimeSlots().map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlot,
                {
                  backgroundColor:
                    selectedDate.getTime() === slot.getTime()
                      ? colors.primary.main
                      : colors.gray[100],
                },
              ]}
              onPress={() => setSelectedDate(slot)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  {
                    color:
                      selectedDate.getTime() === slot.getTime()
                        ? colors.common.white
                        : colors.text.primary,
                  },
                ]}
              >
                {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Schedule Button */}
        <TouchableOpacity
          style={[styles.scheduleButton, { backgroundColor: colors.primary.main }]}
          onPress={handleSchedule}
        >
          <Text style={[styles.scheduleButtonText, { color: colors.common.white }]}>
            Schedule Verification
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
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 12,
  },
  slotsContainer: {
    marginTop: 24,
  },
  slotsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  timeSlot: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeSlotText: {
    fontSize: 16,
    textAlign: 'center',
  },
  scheduleButton: {
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ScheduleVerificationScreen; 