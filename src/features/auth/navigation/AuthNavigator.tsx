import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../../navigation/types'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import { useTheme } from '../../../theme/ThemeProvider'

const Stack = createNativeStackNavigator<AuthStackParamList>()

export const AuthNavigator = () => {
  const { colors, isDark } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? colors.background.dark : colors.background.light,
        },
        headerTintColor: isDark ? colors.text.primaryDark : colors.text.primary,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  )
} 