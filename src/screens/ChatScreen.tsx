import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import { GiftedChat, IMessage, Bubble, Send, InputToolbar, Actions, MessageImage, MessageVideo } from 'react-native-gifted-chat';
import { Contact, Group, ExtendedMessage } from '../types';
import {
  subscribeToMessages,
  sendMessage,
  getChatId,
  createPersonalChat,
  deleteMessage,
} from '../services/firestoreService';
import { uploadMediaFile } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { pick, types, PickerErrorCode, DocumentPickerResponse } from '@react-native-documents/picker';
import { EmojiPopup } from 'react-native-emoji-popup';
import Icon from '@react-native-vector-icons/ionicons';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { chatType, contact, group } = route.params;
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<ExtendedMessage | null>(null);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const giftedChatRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    let chatId = '';
    let isGroup = false;

    // Get chat ID
    if (chatType === 'personal' && contact) {
      chatId = getChatId(user.uid, contact._id);
      // Create chat if it doesn't exist
      createPersonalChat(user.uid, contact._id);
    } else if (chatType === 'group' && group) {
      chatId = group._id;
      isGroup = true;
    }

    if (!chatId) return;

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(chatId, isGroup, (fetchedMessages) => {
      setMessages(fetchedMessages as ExtendedMessage[]);
    });

    return () => unsubscribe();
  }, [user, contact, group, chatType]);

  // Android 13+ permission handling
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const apiLevel = Platform.Version as number;

      if (apiLevel >= 33) {
        // Android 13+ - Request specific media permissions
        const imagePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
        const videoPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
        );

        return (
          imagePermission === PermissionsAndroid.RESULTS.GRANTED &&
          videoPermission === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 12 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Storage permission error:', err);
      return false;
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Camera permission error:', err);
      return false;
    }
  };

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!user) return;

      let chatId = '';
      let isGroup = false;

      if (chatType === 'personal' && contact) {
        chatId = getChatId(user.uid, contact._id);
      } else if (chatType === 'group' && group) {
        chatId = group._id;
        isGroup = true;
      }

      if (!chatId) return;

      try {
        for (const message of newMessages) {
          const messageToSend: any = {
            ...message,
            replyTo: replyToMessage
              ? {
                  _id: replyToMessage._id,
                  text: replyToMessage.text,
                  user: replyToMessage.user,
                }
              : undefined,
          };
          await sendMessage(chatId, messageToSend, isGroup);
        }
        // Clear reply after sending
        setReplyToMessage(null);
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    },
    [user, contact, group, chatType, replyToMessage]
  );

  const handlePickImage = useCallback(async () => {
    try {
      // Request permission first
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to select photos. Please grant permission in Settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.uri) return;

      setUploading(true);

      let chatId = '';
      let isGroup = false;

      if (chatType === 'personal' && contact) {
        chatId = getChatId(user!.uid, contact._id);
      } else if (chatType === 'group' && group) {
        chatId = group._id;
        isGroup = true;
      }

      // Upload to Firebase Storage
      const downloadURL = await uploadMediaFile(asset.uri, chatId, isGroup, 'image');

      // Send message with image
      const message: any = {
        _id: Math.random().toString(36).substring(7),
        text: '',
        createdAt: new Date(),
        user: {
          _id: user!.uid,
          name: user!.displayName || 'You',
        },
        image: downloadURL,
      };

      await sendMessage(chatId, message, isGroup);
      setUploading(false);
    } catch (error) {
      console.error('Error picking image:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  }, [user, contact, group, chatType]);

  const handleTakePhoto = useCallback(async () => {
    try {
      // Request permission first
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to take photos. Please grant permission in Settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result: ImagePickerResponse = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.uri) return;

      setUploading(true);

      let chatId = '';
      let isGroup = false;

      if (chatType === 'personal' && contact) {
        chatId = getChatId(user!.uid, contact._id);
      } else if (chatType === 'group' && group) {
        chatId = group._id;
        isGroup = true;
      }

      // Upload to Firebase Storage
      const downloadURL = await uploadMediaFile(asset.uri, chatId, isGroup, 'image');

      // Send message with image
      const message: any = {
        _id: Math.random().toString(36).substring(7),
        text: '',
        createdAt: new Date(),
        user: {
          _id: user!.uid,
          name: user!.displayName || 'You',
        },
        image: downloadURL,
      };

      await sendMessage(chatId, message, isGroup);
      setUploading(false);
    } catch (error) {
      console.error('Error taking photo:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  }, [user, contact, group, chatType]);

  const handlePickVideo = useCallback(async () => {
    try {
      // Request permission first
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to select videos. Please grant permission in Settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.uri) return;

      setUploading(true);

      let chatId = '';
      let isGroup = false;

      if (chatType === 'personal' && contact) {
        chatId = getChatId(user!.uid, contact._id);
      } else if (chatType === 'group' && group) {
        chatId = group._id;
        isGroup = true;
      }

      // Upload to Firebase Storage
      const downloadURL = await uploadMediaFile(asset.uri, chatId, isGroup, 'video');

      // Send message with video
      const message: any = {
        _id: Math.random().toString(36).substring(7),
        text: '',
        createdAt: new Date(),
        user: {
          _id: user!.uid,
          name: user!.displayName || 'You',
        },
        video: downloadURL,
      };

      await sendMessage(chatId, message, isGroup);
      setUploading(false);
    } catch (error) {
      console.error('Error picking video:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    }
  }, [user, contact, group, chatType]);

  const handlePickDocument = useCallback(async () => {
    try {
      // Request storage permission for Android
      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Storage permission is required to select documents. Please grant permission in Settings.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Pick document with specific file types
      const result = await pick({
        type: [
          types.pdf,
          types.doc,
          types.docx,
          types.xls,
          types.xlsx,
          types.ppt,
          types.pptx,
          types.plainText,
          types.zip,
          types.csv,
        ],
        allowMultiSelection: false,
        mode: 'open',
      });

      if (!result || result.length === 0) return;

      const file = result[0];

      // Validate file exists
      if (!file.uri || !file.name) {
        Alert.alert('Error', 'Invalid file selected.');
        return;
      }

      // Check file size (optional - limit to 10MB)
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
        return;
      }

      setUploading(true);

      let chatId = '';
      let isGroup = false;

      if (chatType === 'personal' && contact) {
        chatId = getChatId(user!.uid, contact._id);
      } else if (chatType === 'group' && group) {
        chatId = group._id;
        isGroup = true;
      }

      // Upload to Firebase Storage
      const downloadURL = await uploadMediaFile(file.uri, chatId, isGroup, 'document', file.name);

      // Get file icon based on type
      const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
          case 'pdf':
            return '📄';
          case 'doc':
          case 'docx':
            return '📝';
          case 'xls':
          case 'xlsx':
            return '📊';
          case 'ppt':
          case 'pptx':
            return '📊';
          case 'zip':
            return '🗜️';
          case 'txt':
            return '📃';
          default:
            return '📎';
        }
      };

      // Send message with document link
      const message: any = {
        _id: Math.random().toString(36).substring(7),
        text: `${getFileIcon(file.name)} ${file.name}`,
        createdAt: new Date(),
        user: {
          _id: user!.uid,
          name: user!.displayName || 'You',
        },
        // Store document URL as a custom field
        document: {
          url: downloadURL,
          name: file.name,
          size: file.size,
          type: file.type,
        },
      };

      await sendMessage(chatId, message, isGroup);
      setUploading(false);
    } catch (error: any) {
      // Check if user cancelled
      if (error?.code === PickerErrorCode.cancelled) {
        return;
      }
      console.error('Error picking document:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  }, [user, contact, group, chatType]);

  const handleDeleteMessage = useCallback(
    async (message: ExtendedMessage) => {
      if (!user || message.user._id !== user.uid) {
        Alert.alert('Error', 'You can only delete your own messages.');
        return;
      }

      Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              let chatId = '';
              let isGroup = false;

              if (chatType === 'personal' && contact) {
                chatId = getChatId(user.uid, contact._id);
              } else if (chatType === 'group' && group) {
                chatId = group._id;
                isGroup = true;
              }

              if (!chatId || !message.firestoreDocId) return;

              await deleteMessage(chatId, message.firestoreDocId, isGroup);
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert('Error', 'Failed to delete message. Please try again.');
            }
          },
        },
      ]);
    },
    [user, contact, group, chatType]
  );

  const handleReplyToMessage = useCallback((message: ExtendedMessage) => {
    setReplyToMessage(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setInputText((prev) => prev + emoji);
  }, []);

  const handleLongPress = useCallback(
    (context: any, message: ExtendedMessage) => {
      const options = ['Reply', 'Cancel'];

      // Add download option for documents
      if (message.document) {
        options.unshift('Download');
      }

      // Only add delete option if it's the user's own message
      if (message.user._id === user?.uid) {
        options.unshift('Delete');
      }

      const cancelButtonIndex = options.length - 1;
      const destructiveButtonIndex = message.user._id === user?.uid ? 0 : -1;

      context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (buttonIndex: number) => {
          if (message.user._id === user?.uid) {
            // User's own message
            if (buttonIndex === 0) {
              // Delete
              handleDeleteMessage(message);
            } else if (buttonIndex === 1 && message.document) {
              // Download document
              Linking.openURL(message.document.url).catch((err) =>
                Alert.alert('Error', 'Unable to open document')
              );
            } else if (buttonIndex === 1 || buttonIndex === 2) {
              // Reply
              handleReplyToMessage(message);
            }
          } else {
            // Other user's message
            if (buttonIndex === 0 && message.document) {
              // Download document
              Linking.openURL(message.document.url).catch((err) =>
                Alert.alert('Error', 'Unable to open document')
              );
            } else if (buttonIndex === 0 || buttonIndex === 1) {
              // Reply
              handleReplyToMessage(message);
            }
          }
        }
      );
    },
    [user, handleDeleteMessage, handleReplyToMessage]
  );

  const chatName = chatType === 'personal' ? contact?.name : group?.name;
  const headerColor = chatType === 'group' ? '#FF9500' : '#007AFF';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderBubble = (props: any) => {
    const currentMessage = props.currentMessage as ExtendedMessage;

    return (
      <View>
        {currentMessage.replyTo && (
          <View style={styles.replyContainer}>
            <View style={styles.replyBar} />
            <View style={styles.replyContent}>
              <Text style={styles.replyName}>{currentMessage.replyTo.user.name}</Text>
              <Text style={styles.replyText} numberOfLines={1}>
                {currentMessage.replyTo.text}
              </Text>
            </View>
          </View>
        )}
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: '#007AFF',
              marginRight: 4,
              marginVertical: 4,
            },
            left: {
              backgroundColor: '#E5E5EA',
              marginLeft: 4,
              marginVertical: 4,
            },
          }}
          textStyle={{
            right: {
              color: '#fff',
              fontSize: 16,
            },
            left: {
              color: '#000',
              fontSize: 16,
            },
          }}
          timeTextStyle={{
            right: {
              color: '#E5F1FF',
            },
            left: {
              color: '#666',
            },
          }}
        />
        {/* Show download button for documents */}
        {currentMessage?.document && (
          <TouchableOpacity
            style={[
              styles.documentDownloadButton,
              currentMessage.user._id === user?.uid ? styles.documentDownloadButtonRight : styles.documentDownloadButtonLeft,
            ]}
            onPress={() => {
              Linking.openURL(currentMessage.document.url).catch(() =>
                Alert.alert('Error', 'Unable to open document')
              );
            }}
          >
            <Icon name="download-outline" size={16} color={currentMessage.user._id === user?.uid ? '#fff' : '#007AFF'} />
            <Text
              style={[
                styles.documentDownloadText,
                currentMessage.user._id === user?.uid ? styles.documentDownloadTextRight : styles.documentDownloadTextLeft,
              ]}
            >
              Tap to open
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props}>
        <View style={styles.sendButton}>
          <Icon name="send" size={24} color="#007AFF" />
        </View>
      </Send>
    );
  };

  const renderActions = (props: any) => {
    return (
      <View style={styles.actionsContainer}>
        {/* Emoji Popup Button */}
        <EmojiPopup onEmojiSelected={handleEmojiSelect}>
          <View style={styles.actionButton}>
            <Icon name="happy-outline" size={28} color="#007AFF" />
          </View>
        </EmojiPopup>

        {/* Attachment Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Choose Attachment',
              'Select an option',
              [
                {
                  text: '📷 Photo Library',
                  onPress: handlePickImage,
                },
                {
                  text: '📸 Take Photo',
                  onPress: handleTakePhoto,
                },
                {
                  text: '🎥 Video',
                  onPress: handlePickVideo,
                },
                {
                  text: '📄 Document',
                  onPress: handlePickDocument,
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ],
              { cancelable: true }
            );
          }}
        >
          <Icon name="attach" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <View>
        {replyToMessage && (
          <View style={styles.replyPreview}>
            <View style={styles.replyPreviewContent}>
              <Text style={styles.replyPreviewTitle}>Replying to {replyToMessage.user.name}</Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>
                {replyToMessage.text}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancelReply} style={styles.replyPreviewClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        <InputToolbar
          {...props}
          containerStyle={styles.inputToolbar}
          primaryStyle={styles.inputPrimary}
        />
      </View>
    );
  };

  const renderMessageImage = (props: any) => {
    return (
      <MessageImage
        {...props}
        imageStyle={{
          width: 200,
          height: 200,
          borderRadius: 13,
          margin: 3,
          resizeMode: 'cover',
        }}
      />
    );
  };

  const renderMessageVideo = (props: any) => {
    return (
      <MessageVideo
        {...props}
        videoProps={{
          resizeMode: 'cover',
          style: {
            width: 200,
            height: 200,
            borderRadius: 13,
            margin: 3,
          },
        }}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={headerColor} />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.headerAvatar}>
          {chatType === 'personal' && contact?.avatar ? (
            <Image source={{ uri: contact.avatar }} style={styles.headerAvatarImage} />
          ) : chatType === 'group' && group?.avatar ? (
            <Image source={{ uri: group.avatar }} style={styles.headerAvatarImage} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>{getInitials(chatName || 'C')}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{chatName}</Text>
          {chatType === 'group' && group && (
            <Text style={styles.headerSubtitle}>{group.members.length} members</Text>
          )}
          {chatType === 'personal' && contact?.status === 'online' && (
            <Text style={styles.headerSubtitle}>Online</Text>
          )}
        </View>
      </View>

      {/* Chat */}
      <GiftedChat
        ref={giftedChatRef}
        messages={messages}
        onSend={onSend}
        user={{
          _id: user?.uid || '1',
          name: user?.displayName || 'You',
        }}
        placeholder="Type a message..."
        alwaysShowSend
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderActions={renderActions}
        renderInputToolbar={renderInputToolbar}
        renderMessageImage={renderMessageImage}
        renderMessageVideo={renderMessageVideo}
        onLongPress={handleLongPress}
        text={inputText}
        onInputTextChanged={setInputText}
        renderAvatar={(props) => {
          if (chatType === 'group' && props.currentMessage?.user._id !== user?.uid) {
            const userName = props.currentMessage?.user.name || 'U';
            return (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarInitial}>{getInitials(userName)}</Text>
              </View>
            );
          }
          return null;
        }}
        showAvatarForEveryMessage={chatType === 'group'}
      />

      {/* Uploading Indicator */}
      {uploading && (
        <View style={styles.uploadingOverlay}>
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  headerAvatar: {
    marginRight: 10,
  },
  headerAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  actionButton: {
    padding: 8,
  },
  inputToolbar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingVertical: 4,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  replyContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    padding: 8,
    marginHorizontal: 8,
    marginTop: 4,
    borderRadius: 8,
  },
  replyBar: {
    width: 3,
    backgroundColor: '#007AFF',
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontWeight: '600',
    color: '#007AFF',
    fontSize: 12,
    marginBottom: 2,
  },
  replyText: {
    color: '#666',
    fontSize: 14,
  },
  replyPreview: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    padding: 12,
    alignItems: 'center',
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewTitle: {
    fontWeight: '600',
    color: '#007AFF',
    fontSize: 12,
    marginBottom: 4,
  },
  replyPreviewText: {
    color: '#666',
    fontSize: 14,
  },
  replyPreviewClose: {
    padding: 4,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#000',
  },
});

export default ChatScreen;