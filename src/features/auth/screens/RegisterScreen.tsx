import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../../store/store'
import { loginSuccess, setError, setLoading } from '../../../store/slices/authSlice'
import { authService } from '../../../services/api/authService'
import { useTheme } from '../../../theme/ThemeProvider'

const RegisterScreen = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const { colors, spacing, typography } = useTheme()
  
  const { loading, error } = useAppSelector(state => state.auth)

  const validateForm = () => {
    if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      dispatch(setError('Please fill in all fields'))
      return false
    }
    
    if (password !== confirmPassword) {
      dispatch(setError('Passwords do not match'))
      return false
    }
    
    if (password.length < 8) {
      dispatch(setError('Password must be at least 8 characters long'))
      return false
    }
    
    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    try {
      dispatch(setLoading(true))
      const response = await authService.register({ email, password, username })
      dispatch(loginSuccess(response))
      // Navigate to main app
      navigation.navigate('Main')
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Registration failed'))
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Create Account
          </Text>
          
          {error && (
            <Text style={[styles.error, { color: colors.status.error }]}>
              {error}
            </Text>
          )}

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.gray[100],
                color: colors.text.primary,
                borderColor: colors.gray[300],
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.text.secondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.gray[100],
                color: colors.text.primary,
                borderColor: colors.gray[300],
              },
            ]}
            placeholder="Username"
            placeholderTextColor={colors.text.secondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.gray[100],
                color: colors.text.primary,
                borderColor: colors.gray[300],
              },
            ]}
            placeholder="Password"
            placeholderTextColor={colors.text.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.gray[100],
                color: colors.text.primary,
                borderColor: colors.gray[300],
              },
            ]}
            placeholder="Confirm Password"
            placeholderTextColor={colors.text.secondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary.main },
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.common.white} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.common.white }]}>
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
          >
            <Text style={[styles.linkText, { color: colors.primary.main }]}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
  },
})

export default RegisterScreen 