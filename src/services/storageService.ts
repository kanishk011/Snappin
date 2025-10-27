import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';

export type MediaType = 'image' | 'video' | 'document';

/**
 * Upload a media file to Firebase Storage
 * @param uri - Local file URI
 * @param chatId - Chat or group ID
 * @param isGroup - Whether this is a group chat
 * @param mediaType - Type of media (image, video, document)
 * @param fileName - Optional custom file name
 * @returns Download URL of the uploaded file
 */
export const uploadMediaFile = async (
  uri: string,
  chatId: string,
  isGroup: boolean,
  mediaType: MediaType,
  fileName?: string
): Promise<string> => {
  try {
    // Generate a unique file name if not provided
    const timestamp = Date.now();
    const fileExtension = uri.split('.').pop() || 'jpg';
    const finalFileName = fileName || `${mediaType}_${timestamp}.${fileExtension}`;

    // Determine the storage path
    const collectionType = isGroup ? 'groups' : 'chats';
    const storagePath = `${collectionType}/${chatId}/media/${finalFileName}`;

    // Handle platform-specific URI formatting
    let uploadUri = uri;
    if (Platform.OS === 'android' && !uri.startsWith('file://')) {
      uploadUri = `file://${uri}`;
    }

    // Upload the file
    const reference = storage().ref(storagePath);
    await reference.putFile(uploadUri);

    // Get the download URL
    const downloadURL = await reference.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Error uploading media file:', error);
    throw error;
  }
};

/**
 * Delete a media file from Firebase Storage
 * @param downloadURL - The download URL of the file to delete
 */
export const deleteMediaFile = async (downloadURL: string): Promise<void> => {
  try {
    const reference = storage().refFromURL(downloadURL);
    await reference.delete();
  } catch (error) {
    console.error('Error deleting media file:', error);
    throw error;
  }
};

/**
 * Get file metadata from Firebase Storage
 * @param downloadURL - The download URL of the file
 * @returns File metadata
 */
export const getFileMetadata = async (downloadURL: string) => {
  try {
    const reference = storage().refFromURL(downloadURL);
    const metadata = await reference.getMetadata();
    return metadata;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};
