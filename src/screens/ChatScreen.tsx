import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
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
        renderAvatar={props => {
          if (chatType === 'group') {
            return (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarInitial}>
                  {props.currentMessage?.user.name?.charAt(0).toUpperCase()}
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderBottomWidth: 1,
    borderBottomColor: '#0051D5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
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
    color: '#E5F1FF',
    marginTop: 2,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatScreen;
