import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RootStackParamList } from './types'
import { useTheme } from '../theme/ThemeProvider'
import { AuthNavigator } from '../features/auth/navigation/AuthNavigator'
import { MainNavigator } from './MainTabNavigator'
import SettingsScreen from '../features/settings/screens/SettingsScreen'
import EditProfileScreen from '../features/profile/screens/EditProfileScreen'
import ChatRoomScreen from '../features/chat/screens/ChatRoomScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export const RootNavigator = () => {
  const { colors, isDark } = useTheme()
  
  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary.main,
          background: isDark ? colors.background.dark : colors.background.light,
          card: isDark ? colors.background.surfaceDark : colors.background.surface,
          text: isDark ? colors.text.primaryDark : colors.text.primary,
          border: colors.gray[300],
          notification: colors.status.error,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
        />
        <Stack.Screen 
          name="Main" 
          component={MainNavigator}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen 
          name="ChatRoom" 
          component={ChatRoomScreen}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
} 