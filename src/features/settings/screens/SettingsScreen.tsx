import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { logout } from '../../../store/slices/authSlice';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors, spacing, typography } = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [locationServices, setLocationServices] = React.useState(true);

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
            dispatch(logout());
            navigation.navigate('Auth');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const MenuItem = ({
    icon,
    title,
    onPress,
    hasSwitch,
    value,
    onValueChange,
  }: {
    icon: string;
    title: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.gray[200] }]}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.menuItemLeft}>
        <Icon name={icon} size={24} color={colors.primary.main} />
        <Text
          style={[
            styles.menuItemText,
            { color: colors.text.primary, marginLeft: spacing.md },
          ]}
        >
          {title}
        </Text>
      </View>
      {hasSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.gray[300], true: colors.primary.main }}
          thumbColor={colors.common.white}
        />
      ) : (
        <Icon name="chevron-forward" size={24} color={colors.gray[400]} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.light }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
          Account
        </Text>
        <MenuItem
          icon="person-outline"
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          hasSwitch
          value={notifications}
          onValueChange={setNotifications}
        />
        <MenuItem
          icon="moon-outline"
          title="Dark Mode"
          hasSwitch
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
          Privacy
        </Text>
        <MenuItem
          icon="location-outline"
          title="Location Services"
          hasSwitch
          value={locationServices}
          onValueChange={setLocationServices}
        />
        <MenuItem
          icon="shield-outline"
          title="Privacy Settings"
          onPress={() => {
            // Navigate to privacy settings
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
          Support
        </Text>
        <MenuItem
          icon="help-circle-outline"
          title="Help Center"
          onPress={() => {
            // Navigate to help center
          }}
        />
        <MenuItem
          icon="document-text-outline"
          title="Terms of Service"
          onPress={() => {
            // Navigate to terms
          }}
        />
        <MenuItem
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          onPress={() => {
            // Navigate to privacy policy
          }}
        />
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.status.error }]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutText, { color: colors.common.white }]}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen; 