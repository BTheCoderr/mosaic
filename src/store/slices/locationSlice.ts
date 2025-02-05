import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Location } from '../../services/location/locationService'

interface LocationState {
  currentLocation: Location | null
  locationEnabled: boolean
  loading: boolean
  error: string | null
  searchRadius: number // in kilometers
}

const initialState: LocationState = {
  currentLocation: null,
  locationEnabled: false,
  loading: false,
  error: null,
  searchRadius: 50, // Default 50km radius
}

export const locationSlice = createSlice({
  name: 'location',
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
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.locationEnabled = action.payload
    },
    updateCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload
      state.loading = false
      state.error = null
    },
    setSearchRadius: (state, action: PayloadAction<number>) => {
      state.searchRadius = action.payload
    },
  },
})

export const {
  setLoading,
  setError,
  setLocationEnabled,
  updateCurrentLocation,
  setSearchRadius,
} = locationSlice.actions

export default locationSlice.reducer 