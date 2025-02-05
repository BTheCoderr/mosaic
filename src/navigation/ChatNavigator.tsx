import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatListScreen from '../features/chat/screens/ChatListScreen';
import ChatRoomScreen from '../features/chat/screens/ChatRoomScreen';
import ScheduleVerificationScreen from '../features/chat/screens/ScheduleVerificationScreen';
import VerificationPreparationScreen from '../features/chat/screens/VerificationPreparationScreen';
import VideoVerificationScreen from '../features/chat/screens/VideoVerificationScreen';
import VerificationFeedbackScreen from '../features/chat/screens/VerificationFeedbackScreen';
import { useTheme } from '../theme/ThemeProvider';

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: {
    matchId: string;
    userName: string;
  };
  ScheduleVerification: {
    matchId: string;
    userName: string;
  };
  VerificationPreparation: {
    matchId: string;
    userName: string;
    scheduledTime: string;
  };
  VideoVerification: {
    matchId: string;
    userName: string;
  };
  VerificationFeedback: {
    matchId: string;
    userName: string;
  };
};

const Stack = createStackNavigator<ChatStackParamList>();

const ChatNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.light,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({
          title: route.params.userName,
        })}
      />
      <Stack.Screen
        name="ScheduleVerification"
        component={ScheduleVerificationScreen}
        options={{
          title: 'Schedule Verification',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="VerificationPreparation"
        component={VerificationPreparationScreen}
        options={{
          title: 'Preparation',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="VideoVerification"
        component={VideoVerificationScreen}
        options={{
          title: 'Video Verification',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VerificationFeedback"
        component={VerificationFeedbackScreen}
        options={{
          title: 'Feedback',
          presentation: 'modal',
          headerLeft: null, // Prevent going back without submitting feedback
        }}
      />
    </Stack.Navigator>
  );
};

export default ChatNavigator; 