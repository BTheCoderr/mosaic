import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../../theme/ThemeProvider'
import { useAppDispatch, useAppSelector } from '../../../store/store'
import { logout } from '../../../store/slices/authSlice'
import Icon from 'react-native-vector-icons/Ionicons'

const ProfileScreen = () => {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const { colors } = useTheme()
  const user = useAppSelector(state => state.auth.user)

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout())
            navigation.navigate('Auth')
          },
        },
      ]
    )
  }

  const MenuItem = ({ icon, title, onPress }: {
    icon: string
    title: string
    onPress: () => void
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.gray[200] }]}
      onPress={onPress}
    >
      <View style={styles.menuItemContent}>
        <Icon name={icon} size={24} color={colors.text.primary} />
        <Text style={[styles.menuItemText, { color: colors.text.primary }]}>
          {title}
        </Text>
      </View>
      <Icon name="chevron-forward" size={24} color={colors.text.secondary} />
    </TouchableOpacity>
  )

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.light }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'https://picsum.photos/200/200' }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={[styles.editImageButton, { backgroundColor: colors.primary.main }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Icon name="camera" size={20} color={colors.common.white} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.name, { color: colors.text.primary }]}>
          {user?.username || 'Your Name'}
        </Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary.main }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={[styles.editButtonText, { color: colors.common.white }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings Menu */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
          Settings
        </Text>
        <MenuItem
          icon="person-outline"
          title="Personal Information"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          onPress={() => navigation.navigate('Settings')}
        />
        <MenuItem
          icon="shield-outline"
          title="Privacy"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
          Preferences
        </Text>
        <MenuItem
          icon="heart-outline"
          title="Dating Preferences"
          onPress={() => navigation.navigate('Settings')}
        />
        <MenuItem
          icon="location-outline"
          title="Location Settings"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
          Account
        </Text>
        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => {/* TODO: Implement help & support */}}
        />
        <MenuItem
          icon="information-circle-outline"
          title="About"
          onPress={() => {/* TODO: Implement about */}}
        />
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: colors.gray[200] }]}
          onPress={handleLogout}
        >
          <View style={styles.menuItemContent}>
            <Icon name="log-out-outline" size={24} color={colors.status.error} />
            <Text style={[styles.menuItemText, { color: colors.status.error }]}>
              Logout
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
})

export default ProfileScreen 