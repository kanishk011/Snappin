import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

// Firestore collections
export const USERS_COLLECTION = 'users';
export const CHATS_COLLECTION = 'chats';
export const MESSAGES_COLLECTION = 'messages';
export const GROUPS_COLLECTION = 'groups';

// Firebase instances
export { firestore, auth, storage };

// Helper to get current user
export const getCurrentUser = () => auth().currentUser;

// Helper to get user ID
export const getCurrentUserId = () => auth().currentUser?.uid || '';
