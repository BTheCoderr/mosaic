import Geolocation from '@react-native-community/geolocation'
import { Platform, PermissionsAndroid } from 'react-native'

export interface Location {
  latitude: number
  longitude: number
  timestamp: number
}

class LocationService {
  private watchId: number | null = null

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization()
      return true
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show matches near you.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } catch (err) {
      console.error('Error requesting location permission:', err)
      return false
    }
  }

  getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
          })
        },
        error => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      )
    })
  }

  startWatchingLocation(onLocationChange: (location: Location) => void): void {
    this.watchId = Geolocation.watchPosition(
      position => {
        onLocationChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        })
      },
      error => {
        console.error('Error watching location:', error)
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 100, // Update every 100 meters
      }
    )
  }

  stopWatchingLocation(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return Math.round(d)
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}

export const locationService = new LocationService() 