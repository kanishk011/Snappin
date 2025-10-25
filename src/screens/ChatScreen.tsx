import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, StatusBar } from 'react-native';
import { GiftedChat, IMessage, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { Contact, Group } from '../types';
import { subscribeToMessages, sendMessage, getChatId, createPersonalChat } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { chatType, contact, group } = route.params;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { user } = useAuth();

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
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [user, contact, group, chatType]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
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
        await sendMessage(chatId, message, isGroup);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [user, contact, group, chatType]);

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
    return (
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
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props}>
        <View style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </View>
      </Send>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={headerColor}
      />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.headerAvatar}>
          {chatType === 'personal' && contact?.avatar ? (
            <Image source={{ uri: contact.avatar }} style={styles.headerAvatarImage} />
          ) : chatType === 'group' && group?.avatar ? (
            <Image source={{ uri: group.avatar }} style={styles.headerAvatarImage} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>
                {getInitials(chatName || 'C')}
              </Text>
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
        renderInputToolbar={renderInputToolbar}
        renderAvatar={(props) => {
          if (chatType === 'group' && props.currentMessage?.user._id !== user?.uid) {
            const userName = props.currentMessage?.user.name || 'U';
            return (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarInitial}>
                  {getInitials(userName)}
                </Text>
              </View>
            );
          }
          return null;
        }}
        showAvatarForEveryMessage={chatType === 'group'}
      />
    </View>
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
  backButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
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
  sendButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
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
});

export default ChatScreen;
