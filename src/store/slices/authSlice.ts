import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  username: string
  profileCompleted: boolean
  // Add other user properties as needed
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
      state.error = null
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.loading = false
      state.error = action.payload
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const {
  setLoading,
  setError,
  loginSuccess,
  logout,
  updateUser,
} = authSlice.actions

export default authSlice.reducer 