import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useTheme } from '../../../theme/ThemeProvider'
import useLocation from '../../../hooks/useLocation'
import Icon from 'react-native-vector-icons/Ionicons'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH
const SWIPE_OUT_DURATION = 250

interface Profile {
  id: string
  name: string
  age: number
  bio: string
  latitude: number
  longitude: number
  images: string[]
}

const DUMMY_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    bio: 'Adventure seeker & coffee lover ☕️',
    latitude: 40.7128,
    longitude: -74.0060,
    images: ['https://picsum.photos/400/600'],
  },
  {
    id: '2',
    name: 'Mike',
    age: 30,
    bio: 'Photographer 📸 Travel enthusiast ✈️',
    latitude: 40.7589,
    longitude: -73.9851,
    images: ['https://picsum.photos/400/601'],
  },
  // Add more dummy profiles
]

const HomeScreen = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const { colors, spacing } = useTheme()
  const position = new Animated.ValueXY()
  const {
    currentLocation,
    locationEnabled,
    loading: locationLoading,
    error: locationError,
    calculateDistance,
    isWithinSearchRadius,
  } = useLocation()

  useEffect(() => {
    // In a real app, fetch profiles from API
    setProfiles(DUMMY_PROFILES)
  }, [])

  useEffect(() => {
    if (locationEnabled && currentLocation) {
      // Filter profiles based on location
      const nearby = profiles.filter(profile =>
        isWithinSearchRadius(profile.latitude, profile.longitude)
      )
      setFilteredProfiles(nearby)
    } else {
      setFilteredProfiles(profiles)
    }
  }, [locationEnabled, currentLocation, profiles])

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy })
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right')
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left')
      } else {
        resetPosition()
      }
    },
  })

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction))
  }

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const item = filteredProfiles[0]
    if (direction === 'right') {
      console.log('Liked:', item.name)
      // TODO: Handle match logic
    }
    setFilteredProfiles(filteredProfiles.slice(1))
    position.setValue({ x: 0, y: 0 })
  }

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start()
  }

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg'],
    })

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    }
  }

  const renderCard = (profile: Profile, index: number) => {
    if (index === 0) {
      return (
        <Animated.View
          key={profile.id}
          style={[styles.card, getCardStyle()]}
          {...panResponder.panHandlers}
        >
          <CardContent profile={profile} />
        </Animated.View>
      )
    }

    return (
      <Animated.View
        key={profile.id}
        style={[styles.card, { top: 10 * (index - 1) }]}
      >
        <CardContent profile={profile} />
      </Animated.View>
    )
  }

  const CardContent = ({ profile }: { profile: Profile }) => {
    const distance = currentLocation
      ? calculateDistance(profile.latitude, profile.longitude)
      : null

    return (
      <View style={styles.cardContent}>
        <Image
          source={{ uri: profile.images[0] }}
          style={styles.image}
        />
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: colors.text.primary }]}>
            {profile.name}, {profile.age}
          </Text>
          {distance !== null && (
            <Text style={[styles.distance, { color: colors.text.secondary }]}>
              {distance} km away
            </Text>
          )}
          <Text style={[styles.bio, { color: colors.text.primary }]}>
            {profile.bio}
          </Text>
        </View>
      </View>
    )
  }

  const renderNoMoreCards = () => (
    <View style={styles.noMoreCards}>
      <Icon name="refresh-outline" size={50} color={colors.text.secondary} />
      <Text style={[styles.noMoreCardsText, { color: colors.text.primary }]}>
        No more profiles to show
      </Text>
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: colors.primary.main }]}
        onPress={() => setFilteredProfiles(profiles)}
      >
        <Text style={[styles.refreshButtonText, { color: colors.common.white }]}>
          Refresh
        </Text>
      </TouchableOpacity>
    </View>
  )

  if (locationLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Finding matches near you...
        </Text>
      </View>
    )
  }

  if (locationError) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="location-off" size={50} color={colors.status.error} />
        <Text style={[styles.errorText, { color: colors.status.error }]}>
          {locationError}
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.light }]}>
      {filteredProfiles.length > 0 ? (
        filteredProfiles.map((profile, index) => renderCard(profile, index)).reverse()
      ) : (
        renderNoMoreCards()
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 20,
    height: SCREEN_HEIGHT * 0.7,
    left: 10,
    top: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  distance: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  bio: {
    fontSize: 16,
    color: 'white',
    marginTop: 8,
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMoreCardsText: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
})

export default HomeScreen 