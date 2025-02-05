import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useAppDispatch, useAppSelector } from '../store/store'
import {
  setLoading,
  setError,
  setLocationEnabled,
  updateCurrentLocation,
} from '../store/slices/locationSlice'
import { locationService } from '../services/location/locationService'
import type { Location } from '../services/location/locationService'

export const useLocation = () => {
  const dispatch = useAppDispatch()
  const [isInitialized, setIsInitialized] = useState(false)
  
  const {
    currentLocation,
    locationEnabled,
    loading,
    error,
    searchRadius,
  } = useAppSelector(state => state.location)

  useEffect(() => {
    if (!isInitialized) {
      initializeLocation()
      setIsInitialized(true)
    }
  }, [isInitialized])

  const initializeLocation = async () => {
    try {
      dispatch(setLoading(true))
      const hasPermission = await locationService.requestPermissions()
      
      if (hasPermission) {
        dispatch(setLocationEnabled(true))
        await updateLocation()
        startLocationUpdates()
      } else {
        dispatch(setLocationEnabled(false))
        Alert.alert(
          'Location Access Required',
          'Please enable location access in your device settings to see matches near you.',
          [{ text: 'OK' }]
        )
      }
    } catch (error) {
      dispatch(setError('Failed to initialize location services'))
    }
  }

  const updateLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation()
      dispatch(updateCurrentLocation(location))
    } catch (error) {
      dispatch(setError('Failed to get current location'))
    }
  }

  const startLocationUpdates = () => {
    locationService.startWatchingLocation((location: Location) => {
      dispatch(updateCurrentLocation(location))
    })
  }

  const stopLocationUpdates = () => {
    locationService.stopWatchingLocation()
  }

  const calculateDistance = (lat: number, lon: number): number => {
    if (!currentLocation) return -1
    return locationService.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      lat,
      lon
    )
  }

  const isWithinSearchRadius = (lat: number, lon: number): boolean => {
    const distance = calculateDistance(lat, lon)
    return distance !== -1 && distance <= searchRadius
  }

  return {
    currentLocation,
    locationEnabled,
    loading,
    error,
    searchRadius,
    updateLocation,
    calculateDistance,
    isWithinSearchRadius,
    startLocationUpdates,
    stopLocationUpdates,
  }
}

export default useLocation 