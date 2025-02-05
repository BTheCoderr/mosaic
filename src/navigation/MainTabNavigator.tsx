import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MainTabParamList } from './types'
import { useTheme } from '../theme/ThemeProvider'
import Icon from 'react-native-vector-icons/Ionicons'

// Screens
import HomeScreen from '../features/home/screens/HomeScreen'
import ChatListScreen from '../features/chat/screens/ChatListScreen'
import MatchesScreen from '../features/matches/screens/MatchesScreen'
import ProfileScreen from '../features/profile/screens/ProfileScreen'

const Tab = createBottomTabNavigator<MainTabParamList>()

export const MainNavigator = () => {
  const { colors, isDark } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: isDark ? colors.background.surfaceDark : colors.background.surface,
          borderTopColor: colors.gray[300],
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        headerStyle: {
          backgroundColor: isDark ? colors.background.dark : colors.background.light,
        },
        headerTintColor: isDark ? colors.text.primaryDark : colors.text.primary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
} 