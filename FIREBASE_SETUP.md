# Firebase Setup Guide for Snappin Chat App

## Overview
This guide will help you set up Firebase for the Snappin chat application with real-time messaging functionality.

## Prerequisites
- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Android app registered in Firebase project
- `google-services.json` file placed in `android/app/`

## Firebase Services Used
1. **Firebase Authentication** - User authentication (Email/Password & Anonymous)
2. **Cloud Firestore** - Real-time database for messages, users, chats, and groups
3. **Firebase Storage** - Media file storage (profile pictures, chat images/videos)

## Installation Steps

### 1. Install Dependencies
Dependencies are already installed in the project:
- `@react-native-firebase/app` - Core Firebase SDK
- `@react-native-firebase/auth` - Authentication
- `@react-native-firebase/firestore` - Cloud Firestore
- `@react-native-firebase/storage` - Cloud Storage

### 2. Android Configuration
Make sure your `android/app/google-services.json` file is in place from Firebase Console.

### 3. Deploy Firebase Rules

#### Firestore Rules
Copy the contents of `firestore.rules` and paste them in:
- Firebase Console → Firestore Database → Rules tab

Or use Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

#### Storage Rules
Copy the contents of `storage.rules` and paste them in:
- Firebase Console → Storage → Rules tab

Or use Firebase CLI:
```bash
firebase deploy --only storage:rules
```

## Firestore Database Structure

### Collections

#### `/users/{userId}`
```javascript
{
  _id: string,           // User ID (matches auth UID)
  name: string,          // Display name
  email: string,         // Email (optional for anonymous users)
  avatar: string,        // Profile picture URL (optional)
  status: string,        // 'online' | 'offline'
  lastSeen: Timestamp,   // Last active time
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `/chats/{chatId}`
```javascript
{
  type: 'personal',
  participants: [userId1, userId2],  // Array of 2 user IDs
  lastMessage: string,               // Last message text
  lastMessageTime: Timestamp,
  createdAt: Timestamp
}
```

#### `/chats/{chatId}/messages/{messageId}`
```javascript
{
  _id: string,          // Message ID
  text: string,         // Message text
  createdAt: Timestamp,
  user: {
    _id: string,       // Sender ID
    name: string,      // Sender name
    avatar: string     // Sender avatar (optional)
  },
  image: string,       // Image URL (optional)
  video: string,       // Video URL (optional)
  audio: string        // Audio URL (optional)
}
```

#### `/groups/{groupId}`
```javascript
{
  _id: string,
  name: string,              // Group name
  avatar: string,            // Group picture URL (optional)
  members: [userId1, ...],   // Array of member IDs
  createdBy: string,         // Creator user ID
  lastMessage: string,
  lastMessageTime: Timestamp,
  createdAt: Timestamp
}
```

#### `/groups/{groupId}/messages/{messageId}`
Same structure as chat messages

## Storage Structure

### Paths
- `/users/{userId}/profile/{fileName}` - User profile pictures
- `/chats/{chatId}/media/{fileName}` - Personal chat media files
- `/groups/{groupId}/media/{fileName}` - Group chat media files

### File Size Limits
- Images: 5MB max
- Videos: 50MB max

## Security Rules Summary

### Firestore Rules
1. **Users Collection**
   - Read: Any authenticated user
   - Create/Update: Only own profile
   - Delete: Denied

2. **Chats Collection**
   - Read: Only chat participants
   - Create: If user is a participant
   - Update: Only participants
   - Delete: Denied

3. **Messages Subcollection**
   - Read: Only chat/group members
   - Create: Only if sender is the authenticated user
   - Update/Delete: Denied (immutable messages)

4. **Groups Collection**
   - Read: Only group members
   - Create: If creator is authenticated
   - Update: Only group members
   - Delete: Only group creator

### Storage Rules
1. **Profile Pictures**
   - Read: Public
   - Write: Only own profile, images only, max 5MB

2. **Chat/Group Media**
   - Read: Authenticated users only
   - Write: Authenticated users, size limits enforced

## Testing the Setup

### 1. Enable Authentication Methods
Go to Firebase Console → Authentication → Sign-in method
Enable:
- Email/Password
- Anonymous

### 2. Create Firestore Database
Go to Firebase Console → Firestore Database → Create database
- Start in **test mode** initially
- Then deploy the security rules from `firestore.rules`

### 3. Create Storage Bucket
Go to Firebase Console → Storage → Get started
- Deploy the security rules from `storage.rules`

### 4. Run the App
```bash
npm start
npm run android
```

## Usage

### Authentication
- Users can sign up with email/password
- Users can sign in with existing credentials
- Users can continue as guest (anonymous auth)

### Features
- **Personal Chat**: Real-time 1-on-1 messaging
- **Group Chat**: Multi-user group conversations
- **Online Status**: See who's online
- **Message History**: Messages persist in Firestore
- **Real-time Updates**: Messages appear instantly

### Creating Test Users
1. Sign up from the app with different accounts
2. Or use Firebase Console → Authentication → Add user

### Creating Test Groups
Use the Firestore console to manually create a group:
```javascript
// Collection: groups
{
  name: "Test Group",
  members: ["userId1", "userId2", "userId3"],
  createdBy: "userId1",
  lastMessage: null,
  lastMessageTime: null,
  createdAt: Firebase.firestore.FieldValue.serverTimestamp()
}
```

## Troubleshooting

### Messages not appearing
- Check Firebase Console → Firestore → Data to verify messages are being saved
- Check browser console for permission errors
- Verify security rules are deployed

### Authentication errors
- Ensure Email/Password and Anonymous are enabled
- Check `google-services.json` is in correct location
- Rebuild the app after adding Firebase config

### Real-time updates not working
- Verify internet connection
- Check Firestore listeners in ChatScreen, ContactList, GroupList
- Look for console errors

## References
- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Security](https://firebase.google.com/docs/storage/security)
- YouTube Tutorial: https://www.youtube.com/watch?v=VR_rCmbSidk

## Next Steps
1. Deploy security rules to production
2. Set up Firebase Functions for push notifications
3. Add message encryption for privacy
4. Implement typing indicators
5. Add read receipts
6. Enable media sharing (images/videos)
