import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserSettings,
  updateUserSettings,
  UserSettings,
} from '../services/firestoreService';
import { COLORS, SIZES } from '../config/theme';

interface SettingItem {
  id: string;
  iconName: string;
  iconType: 'ionicons' | 'material' | 'fontawesome';
  title: string;
  subtitle?: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  settingKey?: keyof UserSettings | string;
  onPress?: () => void;
}

const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const userSettings = await getUserSettings(user.uid);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (settingPath: string, value: boolean) => {
    if (!user || !settings) return;

    try {
      const pathParts = settingPath.split('.');
      const updatedSettings: any = { ...settings };

      if (pathParts.length === 2) {
        const [category, key] = pathParts;
        if (!(category in updatedSettings)) {
          updatedSettings[category] = {};
        }
        updatedSettings[category][key] = value;
      }

      await updateUserSettings(user.uid, updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

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
      subtitle: 'Control who can see your info',
      type: 'navigation',
      onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon!'),
    },
    {
      id: '2',
      iconName: 'lock-closed',
      iconType: 'ionicons',
      title: 'Security',
      subtitle: 'Two-step verification, security',
      type: 'navigation',
      onPress: () => Alert.alert('Security', 'Security settings coming soon!'),
    },
    {
      id: '3',
      iconName: 'database',
      iconType: 'ionicons',
      title: 'Storage',
      subtitle: `Auto-download: ${settings?.storage.autoDownloadImages ? 'Images' : 'Off'}`,
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
      subtitle: settings?.notifications.enabled ? 'On' : 'Off',
      type: 'toggle',
      value: settings?.notifications.enabled || false,
      settingKey: 'notifications.enabled',
    },
    {
      id: '5',
      iconName: 'chatbubbles',
      iconType: 'ionicons',
      title: 'Message Notifications',
      subtitle: settings?.notifications.messageNotifications ? 'On' : 'Off',
      type: 'toggle',
      value: settings?.notifications.messageNotifications || false,
      settingKey: 'notifications.messageNotifications',
    },
    {
      id: '6',
      iconName: 'people',
      iconType: 'ionicons',
      title: 'Group Notifications',
      subtitle: settings?.notifications.groupNotifications ? 'On' : 'Off',
      type: 'toggle',
      value: settings?.notifications.groupNotifications || false,
      settingKey: 'notifications.groupNotifications',
    },
    {
      id: '7',
      iconName: 'volume-high',
      iconType: 'ionicons',
      title: 'Sound',
      subtitle: settings?.notifications.sound ? 'On' : 'Off',
      type: 'toggle',
      value: settings?.notifications.sound || false,
      settingKey: 'notifications.sound',
    },
    {
      id: '8',
      iconName: 'vibration',
      iconType: 'material',
      title: 'Vibration',
      subtitle: settings?.notifications.vibration ? 'On' : 'Off',
      type: 'toggle',
      value: settings?.notifications.vibration || false,
      settingKey: 'notifications.vibration',
    },
  ];

  const storageSettings: SettingItem[] = [
    {
      id: '9',
      iconName: 'image',
      iconType: 'ionicons',
      title: 'Auto-download Images',
      subtitle: settings?.storage.autoDownloadImages ? 'On' : 'Off',
      type: 'toggle',
      value: settings?.storage.autoDownloadImages || false,
      settingKey: 'storage.autoDownloadImages',
    },
    {
      id: '10',
      iconName: 'videocam',
      iconType: 'ionicons',
      title: 'Auto-download Videos',
      subtitle: settings?.storage.autoDownloadVideos ? 'On' : 'Off',
      type: 'toggle',
      value: settings?.storage.autoDownloadVideos || false,
      settingKey: 'storage.autoDownloadVideos',
    },
    {
      id: '11',
      iconName: 'document',
      iconType: 'ionicons',
      title: 'Auto-download Documents',
      subtitle: settings?.storage.autoDownloadDocuments ? 'On' : 'Off',
      type: 'toggle',
      value: settings?.storage.autoDownloadDocuments || false,
      settingKey: 'storage.autoDownloadDocuments',
    },
  ];

  const chatSettings: SettingItem[] = [
    {
      id: '12',
      iconName: 'eye',
      iconType: 'ionicons',
      title: 'Read Receipts',
      subtitle: settings?.privacy.readReceipts ? 'On' : 'Off',
      type: 'toggle',
      value: settings?.privacy.readReceipts || false,
      settingKey: 'privacy.readReceipts',
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: '13',
      iconName: 'help-circle',
      iconType: 'ionicons',
      title: 'Help',
      subtitle: 'Help center, contact us, privacy policy',
      type: 'navigation',
      onPress: () => Alert.alert('Help', 'Help center coming soon!'),
    },
    {
      id: '14',
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
    const iconProps = { size: 24, color: COLORS.primary, style: styles.settingIconStyle };

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
            if (item.settingKey) {
              handleToggleSetting(item.settingKey, value);
            }
          }}
          trackColor={{ false: COLORS.borderLight, true: COLORS.primary }}
          thumbColor="#fff"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {accountSettings.map(renderSettingItem)}
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {appSettings.map(renderSettingItem)}
      </View>

      {/* Storage Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage & Data</Text>
        {storageSettings.map(renderSettingItem)}
      </View>

      {/* Chat Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chat Settings</Text>
        {chatSettings.map(renderSettingItem)}
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
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  profileSection: {
    flexDirection: 'row',
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  profileAvatarContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: SIZES.avatarLg,
    height: SIZES.avatarLg,
    borderRadius: SIZES.avatarLg / 2,
  },
  defaultAvatar: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: SIZES.font3Xl,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    marginLeft: SIZES.base,
  },
  profileName: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    padding: SIZES.base,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconStyle: {
    marginRight: SIZES.base,
    width: 32,
    textAlign: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.base,
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.base,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    marginRight: SIZES.sm,
  },
  logoutText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.error,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SIZES['2xl'],
  },
  appInfoText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfoSubtext: {
    fontSize: SIZES.fontXs,
    color: COLORS.textLight,
  },
});

export default SettingsScreen;
