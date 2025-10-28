/**
 * Database Schema for Snappin Chat Application
 *
 * This file defines the structure of all collections and documents in Firestore.
 * Use this schema as a reference for both mobile app and web app development.
 *
 * Collections:
 * - users: User profiles and authentication data
 * - chats: Personal one-on-one conversations
 * - groups: Group conversations
 * - chats/{chatId}/messages: Messages in personal chats
 * - groups/{groupId}/messages: Messages in group chats
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// ============================================
// COLLECTION NAMES (Constants)
// ============================================
export const COLLECTION_NAMES = {
  USERS: 'users',
  CHATS: 'chats',
  GROUPS: 'groups',
  MESSAGES: 'messages',
  STATUS: 'status',
  USER_SETTINGS: 'userSettings',
} as const;

// ============================================
// USER SCHEMA
// ============================================
export interface UserSchema {
  _id: string; // User ID (same as auth UID)
  name: string; // Display name
  email?: string; // Email address
  avatar?: string; // Profile picture URL
  status: 'online' | 'offline'; // Online status
  lastSeen: FirebaseFirestoreTypes.Timestamp; // Last active timestamp
  createdAt: FirebaseFirestoreTypes.Timestamp; // Account creation time
  updatedAt: FirebaseFirestoreTypes.Timestamp; // Last profile update
}

/**
 * Example User Document:
 * /users/wKAgXoTnQsMMCmV3pWohal4yexA3
 * {
 *   "_id": "wKAgXoTnQsMMCmV3pWohal4yexA3",
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "avatar": "https://...",
 *   "status": "online",
 *   "lastSeen": Timestamp(2025-10-28 10:29:00),
 *   "createdAt": Timestamp(2025-10-20 09:00:00),
 *   "updatedAt": Timestamp(2025-10-28 10:29:00)
 * }
 */

// ============================================
// CHAT SCHEMA (Personal Chats)
// ============================================
export interface ChatSchema {
  _id: string; // Chat ID (format: userId1_userId2, sorted alphabetically)
  type: 'personal'; // Chat type
  participants: string[]; // Array of 2 user IDs
  lastMessage: string | null; // Text preview of last message
  lastMessageTime: FirebaseFirestoreTypes.Timestamp | null; // Time of last message
  createdAt: FirebaseFirestoreTypes.Timestamp; // Chat creation time
  unreadCount?: {
    // Unread message count per user
    [userId: string]: number;
  };
}

/**
 * Example Chat Document:
 * /chats/8DDXEVhIzDdddLAqWu2QPQJBlC73_wKAgXoTnQsMMCmV3pWohal4yexA3
 * {
 *   "_id": "8DDXEVhIzDdddLAqWu2QPQJBlC73_wKAgXoTnQsMMCmV3pWohal4yexA3",
 *   "type": "personal",
 *   "participants": ["8DDXEVhIzDdddLAqWu2QPQJBlC73", "wKAgXoTnQsMMCmV3pWohal4yexA3"],
 *   "lastMessage": "Hi",
 *   "lastMessageTime": Timestamp(2025-10-28 10:29:00),
 *   "createdAt": Timestamp(2025-10-20 09:30:00),
 *   "unreadCount": {
 *     "8DDXEVhIzDdddLAqWu2QPQJBlC73": 2,
 *     "wKAgXoTnQsMMCmV3pWohal4yexA3": 0
 *   }
 * }
 */

// ============================================
// GROUP SCHEMA
// ============================================
export interface GroupSchema {
  _id: string; // Group ID (auto-generated)
  name: string; // Group name
  avatar?: string; // Group picture URL
  description?: string; // Group description
  members: string[]; // Array of user IDs
  admins: string[]; // Array of admin user IDs
  createdBy: string; // User ID of creator
  lastMessage: string | null; // Text preview of last message
  lastMessageTime: FirebaseFirestoreTypes.Timestamp | null; // Time of last message
  createdAt: FirebaseFirestoreTypes.Timestamp; // Group creation time
  updatedAt: FirebaseFirestoreTypes.Timestamp; // Last group update
  unreadCount?: {
    // Unread message count per user
    [userId: string]: number;
  };
}

/**
 * Example Group Document:
 * /groups/cKuMkZIArrdKlSJEd0I
 * {
 *   "_id": "cKuMkZIArrdKlSJEd0I",
 *   "name": "Project Team",
 *   "avatar": "https://...",
 *   "description": "Team discussion group",
 *   "members": ["user1", "user2", "user3"],
 *   "admins": ["user1"],
 *   "createdBy": "user1",
 *   "lastMessage": "Meeting at 3pm",
 *   "lastMessageTime": Timestamp(2025-10-28 10:29:00),
 *   "createdAt": Timestamp(2025-10-20 09:00:00),
 *   "updatedAt": Timestamp(2025-10-28 10:29:00),
 *   "unreadCount": {
 *     "user1": 0,
 *     "user2": 5,
 *     "user3": 3
 *   }
 * }
 */

// ============================================
// MESSAGE SCHEMA
// ============================================

/**
 * Read Receipt Structure
 */
export interface ReadReceiptSchema {
  userId: string; // User ID who read the message
  timestamp: FirebaseFirestoreTypes.Timestamp; // When they read it
}

/**
 * Reply-To Structure (for threaded messages)
 */
export interface ReplyToSchema {
  _id: string; // Original message ID
  text: string; // Original message text
  user: {
    _id: string; // Original sender ID
    name: string; // Original sender name
  };
}

/**
 * Document Attachment Structure
 */
export interface DocumentSchema {
  url: string; // Download URL
  name: string; // File name
  size?: number; // File size in bytes
  type?: string; // MIME type
}

/**
 * Message User Structure
 */
export interface MessageUserSchema {
  _id: string; // User ID
  name: string; // User display name
  avatar?: string; // User avatar URL (optional)
}

/**
 * Message Schema
 * Used in both /chats/{chatId}/messages and /groups/{groupId}/messages
 */
export interface MessageSchema {
  _id: string; // Message ID (client-generated unique ID)
  text: string; // Message text content
  createdAt: FirebaseFirestoreTypes.Timestamp; // Message creation time
  user: MessageUserSchema; // Sender information

  // Media attachments (optional, only one should be present)
  image?: string | null; // Image URL
  video?: string | null; // Video URL
  audio?: string | null; // Audio URL
  document?: DocumentSchema | null; // Document attachment

  // Features
  replyTo?: ReplyToSchema | null; // Reply to another message
  readBy: ReadReceiptSchema[]; // Array of read receipts

  // Metadata
  edited?: boolean; // Whether message was edited
  editedAt?: FirebaseFirestoreTypes.Timestamp; // When it was edited
  deleted?: boolean; // Soft delete flag
  deletedAt?: FirebaseFirestoreTypes.Timestamp; // When it was deleted
}

/**
 * Example Message Document:
 * /chats/poRcN91TRdWugqA2QR70_wKAgXoTnQsMMCmV3pWohal4yexA3/messages/1000235702
 * {
 *   "_id": "1000235702",
 *   "text": "Hi",
 *   "createdAt": Timestamp(2025-10-28 10:29:00),
 *   "user": {
 *     "_id": "wKAgXoTnQsMMCmV3pWohal4yexA3",
 *     "name": "John Doe",
 *     "avatar": "https://..."
 *   },
 *   "image": null,
 *   "video": null,
 *   "audio": null,
 *   "document": null,
 *   "replyTo": null,
 *   "readBy": [
 *     {
 *       "userId": "wKAgXoTnQsMMCmV3pWohal4yexA3",
 *       "timestamp": Timestamp(2025-10-28 10:29:00)
 *     },
 *     {
 *       "userId": "poRcN91TRdWugqA2QR70",
 *       "timestamp": Timestamp(2025-10-28 10:30:00)
 *     }
 *   ],
 *   "edited": false,
 *   "deleted": false
 * }
 */

/**
 * Example Message with Image:
 * {
 *   "_id": "1000235703",
 *   "text": "",
 *   "createdAt": Timestamp(2025-10-28 10:30:00),
 *   "user": { "_id": "user1", "name": "John" },
 *   "image": "https://firebase.storage/.../image.jpg",
 *   "video": null,
 *   "audio": null,
 *   "document": null,
 *   "replyTo": null,
 *   "readBy": [...]
 * }
 */

/**
 * Example Message with Document:
 * {
 *   "_id": "1000235704",
 *   "text": "📄 contract.pdf",
 *   "createdAt": Timestamp(2025-10-28 10:31:00),
 *   "user": { "_id": "user1", "name": "John" },
 *   "image": null,
 *   "video": null,
 *   "audio": null,
 *   "document": {
 *     "url": "https://firebase.storage/.../contract.pdf",
 *     "name": "contract.pdf",
 *     "size": 1048576,
 *     "type": "application/pdf"
 *   },
 *   "replyTo": null,
 *   "readBy": [...]
 * }
 */

/**
 * Example Message with Reply:
 * {
 *   "_id": "1000235705",
 *   "text": "That sounds good!",
 *   "createdAt": Timestamp(2025-10-28 10:32:00),
 *   "user": { "_id": "user2", "name": "Jane" },
 *   "image": null,
 *   "video": null,
 *   "audio": null,
 *   "document": null,
 *   "replyTo": {
 *     "_id": "1000235702",
 *     "text": "Hi",
 *     "user": { "_id": "user1", "name": "John" }
 *   },
 *   "readBy": [...]
 * }
 */

// ============================================
// HELPER TYPES FOR CREATING DOCUMENTS
// ============================================

/**
 * Type for creating a new user (omits server-generated fields)
 */
export type CreateUserInput = Omit<UserSchema, 'createdAt' | 'updatedAt' | 'lastSeen'> & {
  createdAt?: any; // Will be serverTimestamp()
  updatedAt?: any; // Will be serverTimestamp()
  lastSeen?: any; // Will be serverTimestamp()
};

/**
 * Type for creating a new chat (omits server-generated fields)
 */
export type CreateChatInput = Omit<ChatSchema, 'createdAt'> & {
  createdAt?: any; // Will be serverTimestamp()
};

/**
 * Type for creating a new group (omits server-generated fields)
 */
export type CreateGroupInput = Omit<GroupSchema, '_id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: any; // Will be serverTimestamp()
  updatedAt?: any; // Will be serverTimestamp()
};

/**
 * Type for creating a new message (omits server-generated fields)
 */
export type CreateMessageInput = Omit<MessageSchema, 'createdAt' | 'readBy'> & {
  createdAt?: any; // Will be Date or serverTimestamp()
  readBy?: ReadReceiptSchema[]; // Will be initialized with sender
};

// ============================================
// SCHEMA VALIDATION HELPERS
// ============================================

/**
 * Validates if an object matches the UserSchema
 */
export const isValidUser = (data: any): data is UserSchema => {
  return (
    typeof data._id === 'string' &&
    typeof data.name === 'string' &&
    (data.status === 'online' || data.status === 'offline')
  );
};

/**
 * Validates if an object matches the MessageSchema
 */
export const isValidMessage = (data: any): data is MessageSchema => {
  return (
    typeof data._id === 'string' &&
    typeof data.text === 'string' &&
    typeof data.user === 'object' &&
    typeof data.user._id === 'string' &&
    typeof data.user.name === 'string' &&
    Array.isArray(data.readBy)
  );
};

/**
 * Validates if an object matches the ChatSchema
 */
export const isValidChat = (data: any): data is ChatSchema => {
  return (
    typeof data._id === 'string' &&
    data.type === 'personal' &&
    Array.isArray(data.participants) &&
    data.participants.length === 2
  );
};

/**
 * Validates if an object matches the GroupSchema
 */
export const isValidGroup = (data: any): data is GroupSchema => {
  return (
    typeof data._id === 'string' &&
    typeof data.name === 'string' &&
    Array.isArray(data.members) &&
    Array.isArray(data.admins) &&
    typeof data.createdBy === 'string'
  );
};

// ============================================
// EXPORT SCHEMA VERSION
// ============================================

/**
 * Schema version for compatibility tracking
 * Update this when making breaking changes to the schema
 */
export const SCHEMA_VERSION = '1.0.0';

/**
 * Schema metadata
 */
export const SCHEMA_METADATA = {
  version: SCHEMA_VERSION,
  lastUpdated: '2025-10-28',
  description: 'Snappin Chat Application Database Schema',
  collections: {
    users: 'User profiles and authentication data',
    chats: 'Personal one-on-one conversations',
    groups: 'Group conversations',
    messages: 'Messages within chats and groups (subcollection)',
  },
};
