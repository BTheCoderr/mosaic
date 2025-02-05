import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../../store/slices/authSlice'

const API_URL = process.env.API_URL || 'http://localhost:3000/api'
const TOKEN_KEY = '@auth_token'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  username: string
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post('/auth/login', credentials)
      await this.setToken(response.data.token)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post('/auth/register', data)
      await this.setToken(response.data.token)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
      await this.removeToken()
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await api.post('/auth/refresh')
      await this.setToken(response.data.token)
      return response.data.token
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY)
  }

  private async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token)
  }

  private async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY)
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'An error occurred'
      return new Error(message)
    }
    return error instanceof Error ? error : new Error('An unknown error occurred')
  }
}

export const authService = new AuthService() 