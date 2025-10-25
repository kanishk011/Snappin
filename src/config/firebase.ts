import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';

// Initialize Firebase app (this should already be done in your index.js)
const app = getApp();

// Firestore collections
export const USERS_COLLECTION = 'users';
export const CHATS_COLLECTION = 'chats';
export const MESSAGES_COLLECTION = 'messages';
export const GROUPS_COLLECTION = 'groups';

// Firebase instances
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Helper to get current user
export const getCurrentUser = () => auth.currentUser;

// Helper to get user ID
export const getCurrentUserId = () => auth.currentUser?.uid || '';