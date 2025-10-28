/**
 * Firestore Service
 *
 * This service handles all database operations for the Snappin chat application.
 * All data structures follow the schema defined in src/config/dbSchema.ts
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  getDocs,
  Timestamp,
} from '@react-native-firebase/firestore';
import { IMessage } from 'react-native-gifted-chat';
import {
  COLLECTION_NAMES,
  UserSchema,
  ChatSchema,
  GroupSchema,
  MessageSchema,
  CreateUserInput,
  CreateChatInput,
  CreateGroupInput,
  CreateMessageInput,
  ReadReceiptSchema,
} from '../config/dbSchema';

const db = getFirestore();

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Create or update a user profile
 * @param userId - User ID (Firebase Auth UID)
 * @param userData - User data following UserSchema
 */
export const createOrUpdateUser = async (
  userId: string,
  userData: {
    name: string;
    email?: string;
    avatar?: string;
    status?: 'online' | 'offline';
  }
) => {
  try {
    const docData = {
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      status: userData.status || 'online',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    };

    const userRef = doc(db, COLLECTION_NAMES.USERS, userId);
    await setDoc(userRef, docData, { merge: true });

  } catch (error) {
    console.error('❌ Error creating/updating user:', error);
    throw error;
  }
};

/**
 * Update user online status
 * @param userId - User ID
 * @param status - 'online' or 'offline'
 */
export const updateUserStatus = async (userId: string, status: 'online' | 'offline') => {
  try {
    const userRef = doc(db, COLLECTION_NAMES.USERS, userId);
    await updateDoc(userRef, {
      status,
      lastSeen: serverTimestamp(),
    });

  } catch (error) {
    console.error('❌ Error updating user status:', error);
  }
};

/**
 * Get user by ID
 * @param userId - User ID
 * @returns User data or null
 */
export const getUserById = async (userId: string): Promise<UserSchema | null> => {
  try {
    const userRef = doc(db, COLLECTION_NAMES.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.warn('⚠️ User not found:', userId);
      return null;
    }

    return { _id: userDoc.id, ...userDoc.data() } as UserSchema;
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return null;
  }
};

// ============================================
// CHAT MANAGEMENT (Personal Chats)
// ============================================

/**
 * Generate chat ID from two user IDs
 * Format: userId1_userId2 (sorted alphabetically)
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns Chat ID
 */
export const getChatId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

/**
 * Create a personal chat between two users
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns Chat ID
 */
export const createPersonalChat = async (userId1: string, userId2: string): Promise<string> => {
  const chatId = getChatId(userId1, userId2);

  try {
    const chatRef = doc(db, COLLECTION_NAMES.CHATS, chatId);
    const chatDoc = await getDoc(chatRef);

    // Only create if doesn't exist
    if (!chatDoc.exists()) {
      const chatData = {
        type: 'personal',
        participants: [userId1, userId2],
        lastMessage: null,
        lastMessageTime: null,
        createdAt: serverTimestamp(),
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0,
        },
      };

      await setDoc(chatRef, chatData);
    }

    return chatId;
  } catch (error) {
    console.error('❌ Error creating personal chat:', error);
    throw error;
  }
};

// ============================================
// GROUP MANAGEMENT
// ============================================

/**
 * Create a new group
 * @param groupData - Group data
 * @returns Group ID
 */
export const createGroup = async (groupData: {
  name: string;
  avatar?: string;
  description?: string;
  createdBy: string;
  members: string[];
}): Promise<string> => {
  try {
    const groupsRef = collection(db, COLLECTION_NAMES.GROUPS);

    // Initialize unread count for all members
    const unreadCount: { [userId: string]: number } = {};
    groupData.members.forEach((memberId) => {
      unreadCount[memberId] = 0;
    });

    const newGroupData: CreateGroupInput = {
      name: groupData.name,
      avatar: groupData.avatar,
      description: groupData.description,
      members: groupData.members,
      admins: [groupData.createdBy], // Creator is the first admin
      createdBy: groupData.createdBy,
      lastMessage: null,
      lastMessageTime: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCount,
    };

    const groupRef = await addDoc(groupsRef, newGroupData);
    return groupRef.id;
  } catch (error) {
    console.error('❌ Error creating group:', error);
    throw error;
  }
};

/**
 * Add a member to a group
 * @param groupId - Group ID
 * @param userId - User ID to add
 */
export const addMemberToGroup = async (groupId: string, userId: string) => {
  try {
    const groupRef = doc(db, COLLECTION_NAMES.GROUPS, groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
      [`unreadCount.${userId}`]: 0,
      updatedAt: serverTimestamp(),
    });

  } catch (error) {
    console.error('❌ Error adding member to group:', error);
    throw error;
  }
};

/**
 * Update group information
 * @param groupId - Group ID
 * @param updateData - Fields to update
 */
export const updateGroup = async (
  groupId: string,
  updateData: Partial<Pick<GroupSchema, 'name' | 'avatar' | 'description'>>
) => {
  try {
    const groupRef = doc(db, COLLECTION_NAMES.GROUPS, groupId);
    await updateDoc(groupRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

  } catch (error) {
    console.error('❌ Error updating group:', error);
    throw error;
  }
};

// ============================================
// MESSAGE MANAGEMENT
// ============================================

/**
 * Send a message to a chat or group
 * @param chatId - Chat or group ID
 * @param message - Message data (IMessage format)
 * @param isGroup - Whether this is a group chat
 */
export const sendMessage = async (
  chatId: string,
  message: IMessage,
  isGroup: boolean = false
) => {
  try {
    const parentCollection = isGroup ? COLLECTION_NAMES.GROUPS : COLLECTION_NAMES.CHATS;
    const messagesRef = collection(db, parentCollection, chatId, COLLECTION_NAMES.MESSAGES);

    // Build message following MessageSchema
    // Remove undefined values as Firestore doesn't support them
    const messageData: any = {
      _id: message._id.toString(),
      text: message.text || '',
      createdAt: serverTimestamp(),
      user: {
        _id: message.user._id.toString(),
        name: message.user.name || 'Unknown',
      },
      image: message.image || null,
      video: message.video || null,
      audio: message.audio || null,
      document: message.document || null,
      replyTo: message.replyTo
        ? {
            _id: message.replyTo._id.toString(),
            text: message.replyTo.text,
            user: {
              _id: message.replyTo.user._id.toString(),
              name: message.replyTo.user.name || 'Unknown',
            },
          }
        : null,
      readBy: [
        {
          userId: message.user._id.toString(),
          timestamp: new Date(),
        },
      ],
      edited: false,
      deleted: false,
    };

    // Add avatar only if it exists
    if (message.user.avatar) {
      messageData.user.avatar = message.user.avatar;
    }

    await addDoc(messagesRef, messageData);

    // Update last message in parent collection (chat or group)
    const parentRef = doc(db, parentCollection, chatId);
    const parentDoc = await getDoc(parentRef);

    if (parentDoc.exists()) {
      const parentData = parentDoc.data();
      const participants = isGroup ? parentData.members : parentData.participants;

      // Increment unread count for all participants except sender
      const unreadCountUpdate: { [key: string]: any } = {};
      participants.forEach((participantId: string) => {
        if (participantId !== message.user._id) {
          const currentCount = parentData.unreadCount?.[participantId] || 0;
          unreadCountUpdate[`unreadCount.${participantId}`] = currentCount + 1;
        }
      });

      // Determine last message preview text
      let lastMessageText = message.text;
      if (!lastMessageText) {
        if (message.image) lastMessageText = '📷 Photo';
        else if (message.video) lastMessageText = '🎥 Video';
        else if (message.audio) lastMessageText = '🎵 Audio';
        else if (message.document) lastMessageText = `📎 ${message.document.name}`;
        else lastMessageText = '📎 Attachment';
      }

      await updateDoc(parentRef, {
        lastMessage: lastMessageText,
        lastMessageTime: serverTimestamp(),
        ...unreadCountUpdate,
      });
    }

  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Delete a message (soft delete)
 * @param chatId - Chat or group ID
 * @param messageId - Firestore document ID of the message
 * @param isGroup - Whether this is a group chat
 */
export const deleteMessage = async (
  chatId: string,
  messageId: string,
  isGroup: boolean = false
): Promise<void> => {
  try {
    const parentCollection = isGroup ? COLLECTION_NAMES.GROUPS : COLLECTION_NAMES.CHATS;
    const messageRef = doc(db, parentCollection, chatId, COLLECTION_NAMES.MESSAGES, messageId);

    // Soft delete - mark as deleted instead of removing
    await updateDoc(messageRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      text: 'This message was deleted',
    });

  } catch (error) {
    console.error('❌ Error deleting message:', error);
    throw error;
  }
};

/**
 * Mark a message as read
 * @param chatId - Chat or group ID
 * @param messageId - Firestore document ID of the message
 * @param userId - User ID marking the message as read
 * @param isGroup - Whether this is a group chat
 */
export const markMessageAsRead = async (
  chatId: string,
  messageId: string,
  userId: string,
  isGroup: boolean = false
): Promise<void> => {
  try {
    const parentCollection = isGroup ? COLLECTION_NAMES.GROUPS : COLLECTION_NAMES.CHATS;
    const messageRef = doc(db, parentCollection, chatId, COLLECTION_NAMES.MESSAGES, messageId);

    // Get current message data
    const messageDoc = await getDoc(messageRef);
    if (!messageDoc.exists()) {
      console.warn('⚠️ Message does not exist:', messageId);
      return;
    }

    const messageData = messageDoc.data() as MessageSchema;
    const readBy = messageData.readBy || [];

    // Check if user already read this message
    const hasRead = readBy.some((receipt) => receipt.userId === userId);
    if (hasRead) {
      return; // Already marked as read
    }

    // Add user to readBy array
    await updateDoc(messageRef, {
      readBy: arrayUnion({
        userId,
        timestamp: new Date(),
      }),
    });

    // Decrement unread count in parent collection
    const parentRef = doc(db, parentCollection, chatId);
    const parentDoc = await getDoc(parentRef);

    if (parentDoc.exists()) {
      const parentData = parentDoc.data();
      const currentUnread = parentData.unreadCount?.[userId] || 0;

      if (currentUnread > 0) {
        await updateDoc(parentRef, {
          [`unreadCount.${userId}`]: currentUnread - 1,
        });
      }
    }

  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    throw error;
  }
};

/**
 * Mark all messages in a chat as read
 * @param chatId - Chat or group ID
 * @param userId - User ID marking messages as read
 * @param isGroup - Whether this is a group chat
 */
export const markAllMessagesAsRead = async (
  chatId: string,
  userId: string,
  isGroup: boolean = false
): Promise<void> => {
  try {
    const parentCollection = isGroup ? COLLECTION_NAMES.GROUPS : COLLECTION_NAMES.CHATS;
    const messagesRef = collection(db, parentCollection, chatId, COLLECTION_NAMES.MESSAGES);
    const q = query(messagesRef, where('user._id', '!=', userId));

    const querySnapshot = await getDocs(q);
    const markPromises: Promise<void>[] = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data() as MessageSchema;
      const readBy = data.readBy || [];
      const hasRead = readBy.some((receipt) => receipt.userId === userId);

      if (!hasRead) {
        markPromises.push(markMessageAsRead(chatId, docSnapshot.id, userId, isGroup));
      }
    });

    await Promise.all(markPromises);

    // Reset unread count
    const parentRef = doc(db, parentCollection, chatId);
    await updateDoc(parentRef, {
      [`unreadCount.${userId}`]: 0,
    });
  } catch (error) {
    console.error('❌ Error marking all messages as read:', error);
  }
};

// ============================================
// SUBSCRIPTIONS (Real-time listeners)
// ============================================

/**
 * Subscribe to messages in a chat or group
 * @param chatId - Chat or group ID
 * @param isGroup - Whether this is a group chat
 * @param callback - Callback function receiving messages
 * @returns Unsubscribe function
 */
export const subscribeToMessages = (
  chatId: string,
  isGroup: boolean,
  callback: (messages: IMessage[]) => void
): (() => void) => {
  const parentCollection = isGroup ? COLLECTION_NAMES.GROUPS : COLLECTION_NAMES.CHATS;
  const messagesRef = collection(db, parentCollection, chatId, COLLECTION_NAMES.MESSAGES);
  const q = query(messagesRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const messages: IMessage[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as MessageSchema;

        // Skip deleted messages or show as deleted
        if (data.deleted) {
          // You can choose to skip deleted messages or show them differently
          // For now, we'll show them with the deleted text
        }

        // Convert readBy timestamps to Date objects
        const readBy = data.readBy?.map((receipt) => ({
          userId: receipt.userId,
          timestamp: (receipt.timestamp as any)?.toDate?.() || new Date(),
        }));

        // Convert to IMessage format
        messages.push({
          _id: data._id,
          text: data.text,
          createdAt: (data.createdAt as any)?.toDate?.() || new Date(),
          user: {
            _id: data.user._id,
            name: data.user.name,
            avatar: data.user.avatar,
          },
          image: data.image || undefined,
          video: data.video || undefined,
          audio: data.audio || undefined,
          document: data.document || undefined,
          replyTo: data.replyTo || undefined,
          readBy,
          firestoreDocId: docSnapshot.id,
        } as any);
      });

      callback(messages);
    },
    (error) => {
      console.error('❌ Error subscribing to messages:', error);
    }
  );

  return unsubscribe;
};

/**
 * Subscribe to user's personal chats
 * @param userId - Current user ID
 * @param callback - Callback function receiving chats
 * @returns Unsubscribe function
 */
export const subscribeToUserChats = (
  userId: string,
  callback: (chats: any[]) => void
): (() => void) => {
  const chatsRef = collection(db, COLLECTION_NAMES.CHATS);
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    async (querySnapshot) => {
      const chats: any[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const chatData = docSnapshot.data() as ChatSchema;

        // Get other user's data
        const otherUserId = chatData.participants.find((id) => id !== userId);
        const otherUser = otherUserId ? await getUserById(otherUserId) : null;

        chats.push({
          _id: docSnapshot.id,
          ...chatData,
          otherUser,
          unreadCount: chatData.unreadCount?.[userId] || 0,
        });
      }

      callback(chats);
    },
    (error) => {
      console.error('❌ Error subscribing to chats:', error);
    }
  );

  return unsubscribe;
};

/**
 * Subscribe to user's groups
 * @param userId - Current user ID
 * @param callback - Callback function receiving groups
 * @returns Unsubscribe function
 */
export const subscribeToUserGroups = (
  userId: string,
  callback: (groups: any[]) => void
): (() => void) => {
  const groupsRef = collection(db, COLLECTION_NAMES.GROUPS);
  const q = query(
    groupsRef,
    where('members', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const groups: any[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const groupData = docSnapshot.data() as GroupSchema;

        groups.push({
          _id: docSnapshot.id,
          ...groupData,
          unreadCount: groupData.unreadCount?.[userId] || 0,
        });
      });

      callback(groups);
    },
    (error) => {
      console.error('❌ Error subscribing to groups:', error);
    }
  );

  return unsubscribe;
};

/**
 * Subscribe to all users (for contact list)
 * @param currentUserId - Current user ID (to exclude from results)
 * @param callback - Callback function receiving users
 * @returns Unsubscribe function
 */
export const subscribeToUsers = (
  currentUserId: string,
  callback: (users: UserSchema[]) => void
): (() => void) => {
  const usersRef = collection(db, COLLECTION_NAMES.USERS);

  const unsubscribe = onSnapshot(
    usersRef,
    (querySnapshot) => {
      const users: UserSchema[] = [];

      querySnapshot.forEach((docSnapshot) => {
        // Filter out current user
        if (docSnapshot.id !== currentUserId) {
          users.push({
            _id: docSnapshot.id,
            ...docSnapshot.data(),
          } as UserSchema);
        }
      });

      callback(users);
    },
    (error) => {
      console.error('❌ Error subscribing to users:', error);
    }
  );

  return unsubscribe;
};
