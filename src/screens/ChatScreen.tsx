import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { Contact, Group } from '../types';

interface ChatScreenProps {
  chatType: 'personal' | 'group';
  contact?: Contact;
  group?: Group;
  initialMessages: IMessage[];
  onBack: () => void;
  onSendMessage: (newMessages: IMessage[]) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  chatType,
  contact,
  group,
  initialMessages,
  onBack,
  onSendMessage,
}) => {
  const [messages, setMessages] = useState<IMessage[]>(initialMessages);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));
    onSendMessage(newMessages);
  }, [onSendMessage]);

  const chatName = chatType === 'personal' ? contact?.name : group?.name;
  const avatar = chatType === 'personal' ? contact?.avatar : group?.avatar;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
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
          _id: 1,
          name: 'You',
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
