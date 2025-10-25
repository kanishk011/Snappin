import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  arrayUnion,
  Timestamp 
} from '@react-native-firebase/firestore';
import { IMessage } from 'react-native-gifted-chat';
import { USERS_COLLECTION, CHATS_COLLECTION, MESSAGES_COLLECTION, GROUPS_COLLECTION } from '../config/firebase';

const db = getFirestore();

// User Management
export const createOrUpdateUser = async (userId: string, userData: {
  name: string;
  email?: string;
  avatar?: string;
  status?: 'online' | 'offline';
}) => {
  try {
    const docData = {
      _id: userId,
      ...userData,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, docData, { merge: true });

  } catch (error) {
    console.error('❌ Error creating/updating user:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const updateUserStatus = async (userId: string, status: 'online' | 'offline') => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      status,
      lastSeen: serverTimestamp(),
    }, { merge: true });

  } catch (error) {
    console.error('❌ Error updating user status:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
  }
};

export const getUserById = async (userId: string) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? { _id: userDoc.id, ...userDoc.data() } : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Chat Management
export const getChatId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

export const createPersonalChat = async (userId1: string, userId2: string) => {
  const chatId = getChatId(userId1, userId2);
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await setDoc(chatRef, {
      type: 'personal',
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null,
    }, { merge: true });
    return chatId;
  } catch (error) {
    console.error('Error creating personal chat:', error);
    throw error;
  }
};

// Group Management
export const createGroup = async (groupData: {
  name: string;
  avatar?: string;
  createdBy: string;
  members: string[];
}) => {
  try {
    const groupsRef = collection(db, GROUPS_COLLECTION);
    const groupRef = await addDoc(groupsRef, {
      ...groupData,
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null,
    });
    return groupRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const addMemberToGroup = async (groupId: string, userId: string) => {
  try {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
    });
  } catch (error) {
    console.error('Error adding member to group:', error);
    throw error;
  }
};

// Message Management
export const sendMessage = async (
  chatId: string,
  message: IMessage,
  isGroup: boolean = false
) => {
  try {
    const parentCollection = isGroup ? GROUPS_COLLECTION : CHATS_COLLECTION;
    const messagesRef = collection(db, parentCollection, chatId, MESSAGES_COLLECTION);

    await addDoc(messagesRef, {
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      video: message.video || null,
      audio: message.audio || null,
    });

    // Update last message in chat/group
    const parentRef = doc(db, parentCollection, chatId);
    await updateDoc(parentRef, {
      lastMessage: message.text,
      lastMessageTime: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  chatId: string,
  isGroup: boolean,
  callback: (messages: IMessage[]) => void
): (() => void) => {
  const parentCollection = isGroup ? GROUPS_COLLECTION : CHATS_COLLECTION;
  const messagesRef = collection(db, parentCollection, chatId, MESSAGES_COLLECTION);
  const q = query(messagesRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const messages: IMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          _id: data._id,
          text: data.text,
          createdAt: data.createdAt?.toDate() || new Date(),
          user: data.user,
          image: data.image,
          video: data.video,
          audio: data.audio,
        });
      });
      callback(messages);
    },
    (error) => {
      console.error('Error subscribing to messages:', error);
    }
  );

  return unsubscribe;
};

// Get all chats for current user
export const subscribeToUserChats = (
  userId: string,
  callback: (chats: any[]) => void
): (() => void) => {
  const chatsRef = collection(db, CHATS_COLLECTION);
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    async (querySnapshot) => {
      const chats: any[] = [];
      for (const doc of querySnapshot.docs) {
        const chatData = doc.data();
        const otherUserId = chatData.participants.find((id: string) => id !== userId);
        const otherUser = await getUserById(otherUserId);

        chats.push({
          _id: doc.id,
          ...chatData,
          otherUser,
        });
      }
      callback(chats);
    },
    (error) => {
      console.error('Error subscribing to chats:', error);
    }
  );

  return unsubscribe;
};

// Get all groups for current user
export const subscribeToUserGroups = (
  userId: string,
  callback: (groups: any[]) => void
): (() => void) => {
  const groupsRef = collection(db, GROUPS_COLLECTION);
  const q = query(
    groupsRef,
    where('members', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const groups: any[] = [];
      querySnapshot.forEach((doc) => {
        groups.push({
          _id: doc.id,
          ...doc.data(),
        });
      });
      callback(groups);
    },
    (error) => {
      console.error('Error subscribing to groups:', error);
    }
  );

  return unsubscribe;
};

// Get all users (for contact list)
export const subscribeToUsers = (
  currentUserId: string,
  callback: (users: any[]) => void
): (() => void) => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('_id', '!=', currentUserId));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const users: any[] = [];
      querySnapshot.forEach((doc) => {
        users.push({
          _id: doc.id,
          ...doc.data(),
        });
      });
      callback(users);
    },
    (error) => {
      console.error('Error subscribing to users:', error);
    }
  );

  return unsubscribe;
};