import { IMessage } from 'react-native-gifted-chat';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Extended message interface to support additional features
export interface ExtendedMessage extends IMessage {
  replyTo?: {
    _id: string | number;
    text: string;
    user: {
      _id: string | number;
      name: string;
    };
  };
  firestoreDocId?: string; // Firestore document ID for deletion
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  status?: 'online' | 'offline';
  lastSeen?: FirebaseFirestoreTypes.Timestamp;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

export interface Contact extends User {
  lastMessage?: string;
  lastMessageTime?: Date | FirebaseFirestoreTypes.Timestamp;
}

export interface Group {
  _id: string;
  name: string;
  avatar?: string;
  members: string[]; // Array of user IDs
  createdBy: string;
  lastMessage?: string;
  lastMessageTime?: Date | FirebaseFirestoreTypes.Timestamp;
  createdAt?: Date | FirebaseFirestoreTypes.Timestamp;
}

export interface Chat {
  _id: string;
  type: 'personal' | 'group';
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: FirebaseFirestoreTypes.Timestamp;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  otherUser?: User;
}

export interface ChatData {
  [key: string]: IMessage[];
}

export type TabType = 'Personal' | 'Group';

export type ScreenType = 'list' | 'chat' | 'auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
