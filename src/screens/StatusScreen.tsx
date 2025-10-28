import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAuth } from '../contexts/AuthContext';

interface StatusItem {
  id: string;
  userName: string;
  userAvatar?: string;
  timeAgo: string;
  viewed: boolean;
}

const StatusScreen: React.FC = () => {
  const { user } = useAuth();

  // Dummy data for status updates
  const myStatus: StatusItem | null = null; // No status yet
  const recentStatuses: StatusItem[] = [
    {
      id: '1',
      userName: 'Alice Johnson',
      timeAgo: '2m ago',
      viewed: false,
    },
    {
      id: '2',
      userName: 'Bob Smith',
      timeAgo: '15m ago',
      viewed: false,
    },
    {
      id: '3',
      userName: 'Carol Williams',
      timeAgo: '45m ago',
      viewed: false,
    },
  ];

  const viewedStatuses: StatusItem[] = [
    {
      id: '4',
      userName: 'David Brown',
      timeAgo: '3h ago',
      viewed: true,
    },
    {
      id: '5',
      userName: 'Emma Davis',
      timeAgo: '5h ago',
      viewed: true,
    },
    {
      id: '6',
      userName: 'Frank Miller',
      timeAgo: '8h ago',
      viewed: true,
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

  const renderStatusItem = (item: StatusItem) => (
    <TouchableOpacity key={item.id} style={styles.statusItem}>
      <View style={styles.statusAvatarContainer}>
        <View
          style={[
            styles.statusBorder,
            item.viewed ? styles.viewedBorder : styles.unviewedBorder,
          ]}
        >
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.statusAvatar} />
          ) : (
            <View style={[styles.statusAvatar, styles.defaultAvatar]}>
              <Text style={styles.avatarText}>{getInitials(item.userName)}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.statusInfo}>
        <Text style={styles.statusName}>{item.userName}</Text>
        <Text style={styles.statusTime}>{item.timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* My Status Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.myStatusItem}>
          <View style={styles.myStatusAvatarContainer}>
            <View style={styles.myStatusAvatar}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.statusAvatar} />
              ) : (
                <View style={[styles.statusAvatar, styles.defaultAvatar]}>
                  <Text style={styles.avatarText}>
                    {user?.displayName ? getInitials(user.displayName) : 'ME'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.addStatusButton}>
              <Ionicons name="add" size={18} color="#fff" />
            </View>
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.myStatusName}>My Status</Text>
            <Text style={styles.statusTime}>
              {myStatus ? myStatus.timeAgo : 'Tap to add status update'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Updates */}
      {recentStatuses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent updates</Text>
          {recentStatuses.map(renderStatusItem)}
        </View>
      )}

      {/* Viewed Updates */}
      {viewedStatuses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Viewed updates</Text>
          {viewedStatuses.map(renderStatusItem)}
        </View>
      )}

      {/* Privacy Info */}
      <View style={styles.privacyContainer}>
        <Ionicons name="lock-closed" size={16} color="#8E8E93" style={styles.privacyIcon} />
        <Text style={styles.privacyText}>
          Your status updates are end-to-end encrypted
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  myStatusItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  myStatusAvatarContainer: {
    position: 'relative',
  },
  myStatusAvatar: {
    position: 'relative',
  },
  addStatusButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  statusAvatarContainer: {
    position: 'relative',
  },
  statusBorder: {
    padding: 2,
    borderRadius: 32,
    borderWidth: 2.5,
  },
  unviewedBorder: {
    borderColor: '#25D366',
  },
  viewedBorder: {
    borderColor: '#E5E5EA',
  },
  statusAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultAvatar: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  myStatusName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 16,
  },
  privacyIcon: {
    marginRight: 8,
  },
  privacyText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default StatusScreen;
