import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToStatuses,
  createStatus,
  deleteStatus,
  markStatusAsViewed,
  StatusUpdate,
  getUserById,
} from '../services/firestoreService';
import { COLORS, SIZES, SHADOWS } from '../config/theme';
import storage from '@react-native-firebase/storage';

const { width } = Dimensions.get('window');

const StatusScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myStatuses, setMyStatuses] = useState<StatusUpdate[]>([]);
  const [otherStatuses, setOtherStatuses] = useState<StatusUpdate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video'>('text');
  const [creating, setCreating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusUpdate | null>(null);
  const [showStatusViewer, setShowStatusViewer] = useState(false);
  const [showViewedList, setShowViewedList] = useState(false);
  const [viewedByUsers, setViewedByUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToStatuses(user.uid, (statuses) => {
      setMyStatuses(statuses.myStatuses);
      setOtherStatuses(statuses.otherStatuses);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSelectMedia = async (type: 'image' | 'video') => {
    const result = await launchImageLibrary({
      mediaType: type === 'image' ? 'photo' : 'video',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]) {
      setSelectedMedia(result.assets[0]);
      setMediaType(type);
      setShowCreateModal(true);
    }
  };

  const uploadMedia = async (uri: string, type: 'image' | 'video'): Promise<string> => {
    const filename = `status/${user?.uid}/${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`;
    const reference = storage().ref(filename);
    await reference.putFile(uri);
    return await reference.getDownloadURL();
  };

  const handleCreateStatus = async () => {
    if (!user) return;

    if (mediaType === 'text' && !statusText.trim()) {
      Alert.alert('Error', 'Please enter some text for your status');
      return;
    }

    if ((mediaType === 'image' || mediaType === 'video') && !selectedMedia) {
      Alert.alert('Error', 'Please select media');
      return;
    }

    setCreating(true);
    try {
      let mediaUrl = undefined;

      if (selectedMedia && selectedMedia.uri) {
        mediaUrl = await uploadMedia(selectedMedia.uri, mediaType);
      }

      await createStatus({
        userId: user.uid,
        userName: user.displayName || user.email || 'Unknown',
        userAvatar: user.photoURL,
        text: statusText.trim() || undefined,
        mediaUrl,
        mediaType,
        backgroundColor: getRandomColor(),
      });

      setStatusText('');
      setSelectedMedia(null);
      setMediaType('text');
      setShowCreateModal(false);
      Alert.alert('Success', 'Status created successfully!');
    } catch (error) {
      console.error('Error creating status:', error);
      Alert.alert('Error', 'Failed to create status');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStatus = (statusId: string) => {
    Alert.alert(
      'Delete Status',
      'Are you sure you want to delete this status?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStatus(statusId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete status');
            }
          },
        },
      ]
    );
  };

  const handleViewStatus = async (status: StatusUpdate) => {
    if (!user) return;

    // Mark as viewed if not already viewed
    if (!status.viewedBy.includes(user.uid)) {
      await markStatusAsViewed(status._id, user.uid);
    }

    setSelectedStatus(status);
    setShowStatusViewer(true);
  };

  const handleShowViewedList = async (status: StatusUpdate) => {
    const users = await Promise.all(
      status.viewedBy.map(async (userId) => {
        const userData = await getUserById(userId);
        return userData;
      })
    );
    setViewedByUsers(users.filter(u => u !== null));
    setShowViewedList(true);
  };

  const getRandomColor = () => {
    const colors = [COLORS.primary, COLORS.primaryDark, COLORS.accent, '#6366F1', '#8B5CF6', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const renderStatusItem = (status: StatusUpdate, isMyStatus: boolean = false) => {
    const viewed = user && status.viewedBy.includes(user.uid);

    return (
      <TouchableOpacity
        key={status._id}
        style={styles.statusItem}
        onPress={() => isMyStatus ? handleShowViewedList(status) : handleViewStatus(status)}
        onLongPress={() => isMyStatus && handleDeleteStatus(status._id)}
      >
        <View style={styles.statusAvatarContainer}>
          <View
            style={[
              styles.statusBorder,
              viewed ? styles.viewedBorder : styles.unviewedBorder,
            ]}
          >
            {status.userAvatar ? (
              <Image source={{ uri: status.userAvatar }} style={styles.statusAvatar} />
            ) : (
              <View style={[styles.statusAvatar, styles.defaultAvatar]}>
                <Text style={styles.avatarText}>{getInitials(status.userName)}</Text>
              </View>
            )}
            {status.mediaType === 'video' && (
              <View style={styles.mediaTypeBadge}>
                <Ionicons name="videocam" size={12} color="#fff" />
              </View>
            )}
            {status.mediaType === 'image' && (
              <View style={styles.mediaTypeBadge}>
                <Ionicons name="image" size={12} color="#fff" />
              </View>
            )}
          </View>
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.statusName}>{status.userName}</Text>
          <Text style={styles.statusTime}>{getTimeAgo(status.createdAt)}</Text>
        </View>
        {isMyStatus && (
          <View style={styles.statusViewsContainer}>
            <Ionicons name="eye" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statusViews}>{status.viewedBy.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const unviewedStatuses = otherStatuses.filter(s => !s.viewedBy.includes(user?.uid || ''));
  const viewedStatuses = otherStatuses.filter(s => s.viewedBy.includes(user?.uid || ''));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* My Status Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.myStatusItem} onPress={() => {
            setMediaType('text');
            setSelectedMedia(null);
            setShowCreateModal(true);
          }}>
            <View style={styles.myStatusAvatarContainer}>
              <View style={styles.myStatusAvatar}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.statusAvatar} />
                ) : (
                  <View style={[styles.statusAvatar, styles.defaultAvatar]}>
                    <Text style={styles.avatarText}>
                      {user?.displayName ? getInitials(user.displayName) : user?.email ? getInitials(user.email) : 'ME'}
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
                {myStatuses.length > 0 ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''}` : 'Tap to add status update'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* My Statuses List */}
          {myStatuses.map(status => renderStatusItem(status, true))}
        </View>

        {/* Recent Updates */}
        {unviewedStatuses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent updates</Text>
            {unviewedStatuses.map(status => renderStatusItem(status, false))}
          </View>
        )}

        {/* Viewed Updates */}
        {viewedStatuses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Viewed updates</Text>
            {viewedStatuses.map(status => renderStatusItem(status, false))}
          </View>
        )}

        {/* Privacy Info */}
        <View style={styles.privacyContainer}>
          <Ionicons name="lock-closed" size={16} color={COLORS.textSecondary} style={styles.privacyIcon} />
          <Text style={styles.privacyText}>
            Your status updates are end-to-end encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.fabSmall]}
          onPress={() => handleSelectMedia('image')}
        >
          <Ionicons name="image" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.fabSmall]}
          onPress={() => handleSelectMedia('video')}
        >
          <Ionicons name="videocam" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Create Status Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Status</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedMedia && selectedMedia.uri && (
              <View style={styles.mediaPreview}>
                {mediaType === 'image' ? (
                  <Image source={{ uri: selectedMedia.uri }} style={styles.mediaImage} />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Ionicons name="videocam" size={48} color={COLORS.primary} />
                    <Text style={styles.videoText}>Video selected</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => {
                    setSelectedMedia(null);
                    setMediaType('text');
                  }}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            )}

            <TextInput
              style={styles.statusInput}
              placeholder={mediaType === 'text' ? "What's on your mind?" : "Add a caption..."}
              placeholderTextColor={COLORS.textLight}
              multiline
              value={statusText}
              onChangeText={setStatusText}
              maxLength={200}
            />

            <Text style={styles.charCount}>{statusText.length}/200</Text>

            {mediaType === 'text' && !selectedMedia && (
              <View style={styles.mediaButtons}>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => handleSelectMedia('image')}
                >
                  <Ionicons name="image" size={24} color={COLORS.primary} />
                  <Text style={styles.mediaButtonText}>Image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => handleSelectMedia('video')}
                >
                  <Ionicons name="videocam" size={24} color={COLORS.primary} />
                  <Text style={styles.mediaButtonText}>Video</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.createButton, creating && styles.createButtonDisabled]}
              onPress={handleCreateStatus}
              disabled={creating || (!statusText.trim() && !selectedMedia)}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Post Status</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Status Viewer Modal */}
      <Modal
        visible={showStatusViewer}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowStatusViewer(false)}
      >
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerHeader}>
            <View style={styles.viewerUserInfo}>
              {selectedStatus?.userAvatar ? (
                <Image source={{ uri: selectedStatus.userAvatar }} style={styles.viewerAvatar} />
              ) : (
                <View style={[styles.viewerAvatar, styles.defaultAvatar]}>
                  <Text style={styles.viewerAvatarText}>
                    {selectedStatus ? getInitials(selectedStatus.userName) : ''}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.viewerUserName}>{selectedStatus?.userName}</Text>
                <Text style={styles.viewerTime}>
                  {selectedStatus && getTimeAgo(selectedStatus.createdAt)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowStatusViewer(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.viewerContent}>
            {selectedStatus?.mediaType === 'image' && selectedStatus.mediaUrl ? (
              <Image source={{ uri: selectedStatus.mediaUrl }} style={styles.viewerImage} />
            ) : selectedStatus?.mediaType === 'video' && selectedStatus.mediaUrl ? (
              <View style={styles.viewerVideoPlaceholder}>
                <Ionicons name="play-circle" size={64} color="#fff" />
                <Text style={styles.viewerVideoText}>Video Status</Text>
              </View>
            ) : (
              <View style={[styles.viewerTextContainer, { backgroundColor: selectedStatus?.backgroundColor }]}>
                <Text style={styles.viewerText}>{selectedStatus?.text}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Viewed By List Modal */}
      <Modal
        visible={showViewedList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowViewedList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.viewedListModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Viewed by {viewedByUsers.length}</Text>
              <TouchableOpacity onPress={() => setShowViewedList(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={viewedByUsers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.viewedUserItem}>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.viewedUserAvatar} />
                  ) : (
                    <View style={[styles.viewedUserAvatar, styles.defaultAvatar]}>
                      <Text style={styles.viewedUserAvatarText}>{getInitials(item.name)}</Text>
                    </View>
                  )}
                  <Text style={styles.viewedUserName}>{item.name}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
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
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.surfaceLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  myStatusItem: {
    flexDirection: 'row',
    padding: SIZES.base,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
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
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  statusItem: {
    flexDirection: 'row',
    padding: SIZES.base,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  statusAvatarContainer: {
    position: 'relative',
  },
  statusBorder: {
    padding: 2,
    borderRadius: 32,
    borderWidth: 2.5,
    position: 'relative',
  },
  unviewedBorder: {
    borderColor: COLORS.primary,
  },
  viewedBorder: {
    borderColor: COLORS.borderLight,
  },
  statusAvatar: {
    width: SIZES.avatarMd,
    height: SIZES.avatarMd,
    borderRadius: SIZES.avatarMd / 2,
  },
  defaultAvatar: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '600',
  },
  mediaTypeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  statusInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  statusName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  myStatusName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  statusTime: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  statusViewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusViews: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
    marginTop: SIZES.base,
  },
  privacyIcon: {
    marginRight: SIZES.sm,
  },
  privacyText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: SIZES.xl,
    right: SIZES.xl,
    flexDirection: 'column',
    gap: SIZES.md,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  fabSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  modalTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
  },
  mediaPreview: {
    position: 'relative',
    marginBottom: SIZES.base,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radiusMd,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    marginTop: SIZES.sm,
    fontSize: SIZES.fontBase,
    color: COLORS.textSecondary,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statusInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.base,
    fontSize: SIZES.fontMd,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: SIZES.sm,
    color: COLORS.text,
  },
  charCount: {
    textAlign: 'right',
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.base,
  },
  mediaButton: {
    alignItems: 'center',
    padding: SIZES.md,
  },
  mediaButtonText: {
    marginTop: SIZES.xs,
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.base,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.base,
    paddingTop: SIZES['2xl'],
  },
  viewerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.md,
  },
  viewerAvatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  viewerUserName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.white,
  },
  viewerTime: {
    fontSize: SIZES.fontSm,
    color: COLORS.white,
    opacity: 0.8,
  },
  viewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: width,
    height: width * 1.5,
    resizeMode: 'contain',
  },
  viewerVideoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerVideoText: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    marginTop: SIZES.base,
  },
  viewerTextContainer: {
    width: width - 40,
    padding: SIZES['2xl'],
    borderRadius: SIZES.radiusLg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  viewerText: {
    fontSize: SIZES.fontXl,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  viewedListModal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    width: '85%',
    maxHeight: '70%',
  },
  viewedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  viewedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.md,
  },
  viewedUserAvatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  viewedUserName: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
});

export default StatusScreen;
