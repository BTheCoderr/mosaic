import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
  }

  private configure() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create default channels for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'verification-reminders',
          channelName: 'Verification Reminders',
          channelDescription: 'Notifications for upcoming video verifications',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel 'verification-reminders' created: ${created}`)
      );
    }
  }

  scheduleVerificationReminder(matchId: string, userName: string, scheduledTime: Date) {
    const reminderTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000); // 15 minutes before

    PushNotification.localNotificationSchedule({
      channelId: 'verification-reminders',
      title: 'Upcoming Video Verification',
      message: `Your verification call with ${userName} starts in 15 minutes`,
      date: reminderTime,
      allowWhileIdle: true,
      userInfo: { matchId },
    });

    // Schedule another reminder 1 minute before
    PushNotification.localNotificationSchedule({
      channelId: 'verification-reminders',
      title: 'Video Verification Starting Soon',
      message: `Your verification call with ${userName} starts in 1 minute`,
      date: new Date(scheduledTime.getTime() - 60 * 1000),
      allowWhileIdle: true,
      userInfo: { matchId },
    });
  }

  cancelVerificationReminders(matchId: string) {
    PushNotification.cancelAllLocalNotifications();
  }
}

export const notificationService = new NotificationService(); 