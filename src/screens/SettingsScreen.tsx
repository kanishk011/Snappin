import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { useAuth } from '../contexts/AuthContext';

interface SettingItem {
  id: string;
  iconName: string;
  iconType: 'ionicons' | 'material' | 'fontawesome';
  title: string;
  subtitle?: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };

  const accountSettings: SettingItem[] = [
    {
      id: '1',
      iconName: 'shield-checkmark',
      iconType: 'ionicons',
      title: 'Privacy',
      subtitle: 'Block contacts, disappearing messages',
      type: 'navigation',
      onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon!'),
    },
    {
      id: '2',
      iconName: 'lock-closed',
      iconType: 'ionicons',
      title: 'Security',
      subtitle: 'Two-step verification, change number',
      type: 'navigation',
      onPress: () => Alert.alert('Security', 'Security settings coming soon!'),
    },
    {
      id: '3',
      iconName: 'database',
      iconType: 'ionicons',
      title: 'Storage and data',
      subtitle: 'Network usage, auto-download',
      type: 'navigation',
      onPress: () => Alert.alert('Storage', 'Storage settings coming soon!'),
    },
  ];

  const appSettings: SettingItem[] = [
    {
      id: '4',
      iconName: 'notifications',
      iconType: 'ionicons',
      title: 'Notifications',
      subtitle: notificationsEnabled ? 'On' : 'Off',
      type: 'toggle',
      value: notificationsEnabled,
    },
    {
      id: '5',
      iconName: 'volume-high',
      iconType: 'ionicons',
      title: 'Sound',
      subtitle: soundEnabled ? 'On' : 'Off',
      type: 'toggle',
      value: soundEnabled,
    },
    {
      id: '6',
      iconName: 'chatbubbles',
      iconType: 'ionicons',
      title: 'Chats',
      subtitle: 'Theme, wallpapers, chat history',
      type: 'navigation',
      onPress: () => Alert.alert('Chats', 'Chat settings coming soon!'),
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: '7',
      iconName: 'help-circle',
      iconType: 'ionicons',
      title: 'Help',
      subtitle: 'Help center, contact us, privacy policy',
      type: 'navigation',
      onPress: () => Alert.alert('Help', 'Help center coming soon!'),
    },
    {
      id: '8',
      iconName: 'people',
      iconType: 'ionicons',
      title: 'Invite a friend',
      type: 'navigation',
      onPress: () => Alert.alert('Invite', 'Invite feature coming soon!'),
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderIcon = (iconName: string, iconType: string) => {
    const iconProps = { size: 24, color: '#25D366', style: styles.settingIconStyle };

    switch (iconType) {
      case 'ionicons':
        return <Ionicons name={iconName} {...iconProps} />;
      case 'material':
        return <MaterialIcons name={iconName} {...iconProps} />;
      case 'fontawesome':
        return <FontAwesome name={iconName} {...iconProps} />;
      default:
        return <Ionicons name={iconName} {...iconProps} />;
    }
  };

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
      activeOpacity={0.6}
    >
      <View style={styles.settingLeft}>
        {renderIcon(item.iconName, item.iconType)}
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={(value) => {
            if (item.id === '4') {
              setNotificationsEnabled(value);
            } else if (item.id === '5') {
              setSoundEnabled(value);
            }
          }}
          trackColor={{ false: '#E5E5EA', true: '#25D366' }}
          thumbColor="#fff"
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <TouchableOpacity style={styles.profileSection} onPress={handleEditProfile}>
        <View style={styles.profileAvatarContainer}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileAvatar} />
          ) : (
            <View style={[styles.profileAvatar, styles.defaultAvatar]}>
              <Text style={styles.avatarText}>
                {user?.displayName ? getInitials(user.displayName) : user?.email ? getInitials(user.email) : 'ME'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user?.displayName || user?.email || 'User'}
          </Text>
          <Text style={styles.profileStatus}>Hey there! I am using Snappin</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {accountSettings.map(renderSettingItem)}
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        {appSettings.map(renderSettingItem)}
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {supportSettings.map(renderSettingItem)}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#FF3B30" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>Snappin v1.0.0</Text>
        <View style={styles.appInfoRow}>
          <Text style={styles.appInfoSubtext}>Made with </Text>
          <Ionicons name="heart" size={12} color="#FF3B30" />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  profileSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatarContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  defaultAvatar: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconStyle: {
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  chevron: {
    fontSize: 28,
    color: '#C7C7CC',
    fontWeight: '300',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appInfoText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#C7C7CC',
  },
});

export default SettingsScreen;
