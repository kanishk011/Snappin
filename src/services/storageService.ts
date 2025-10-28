import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

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
    // Validate input
    if (!uri || uri === 'null' || uri === 'undefined') {
      throw new Error('Invalid file URI provided');
    }

    // Generate a unique file name if not provided
    const timestamp = Date.now();
    const fileExtension = uri.split('.').pop() || getDefaultExtension(mediaType);
    const finalFileName = fileName || `${mediaType}_${timestamp}.${fileExtension}`;

    // Determine the storage path
    const collectionType = isGroup ? 'groups' : 'chats';
    const storagePath = `${collectionType}/${chatId}/media/${finalFileName}`;

    let uploadUri = uri;

    if (Platform.OS === 'android') {
      if (uri.startsWith('content://')) {
        // For document content URIs, we need special handling
        if (mediaType === 'document') {
          // Use react-native-blob-util to copy the file to a temporary location
          // This resolves the Permission Denial issue for documents
          const fileCopyUri = await copyDocumentToTemp(uri, finalFileName);
          uploadUri = fileCopyUri;
        } else {
          // For images and videos, use the existing approach
          const decodedUri = decodeURIComponent(uri);
          try {
            const stat = await ReactNativeBlobUtil.fs.stat(decodedUri);
            uploadUri = stat.path;
          } catch (statError) {
            console.warn('Could not stat file, trying direct upload with content URI');
            uploadUri = decodedUri;
          }
        }
      } else if (!uri.startsWith('file://')) {
        uploadUri = `file://${uri}`;
      }
    }

    // Upload the file
    const reference = storage().ref(storagePath);
    await reference.putFile(uploadUri);

    // Clean up temporary file if it was created for documents
    if (Platform.OS === 'android' && mediaType === 'document' && uploadUri !== uri) {
      try {
        await ReactNativeBlobUtil.fs.unlink(uploadUri);
      } catch (cleanupError) {
        console.warn('Could not clean up temporary file:', cleanupError);
      }
    }

    // Get the download URL
    const downloadURL = await reference.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Error uploading media file:', error);
    throw error;
  }
};

/**
 * Copy document from content URI to temporary file location
 * This resolves the permission issues with document URIs
 */
const copyDocumentToTemp = async (contentUri: string, fileName: string): Promise<string> => {
  try {
    // Create a temporary file path
    const tempDir = ReactNativeBlobUtil.fs.dirs.CacheDir;
    const tempFilePath = `${tempDir}/${fileName}`;

    // Copy the file from content URI to temporary location
    await ReactNativeBlobUtil.fs.cp(contentUri, tempFilePath);

    return tempFilePath;
  } catch (error) {
    console.error('Error copying document to temp:', error);
    throw new Error('Failed to access document file');
  }
};

/**
 * Get default file extension based on media type
 */
const getDefaultExtension = (mediaType: MediaType): string => {
  switch (mediaType) {
    case 'image':
      return 'jpg';
    case 'video':
      return 'mp4';
    case 'document':
      return 'pdf';
    default:
      return 'file';
  }
};

// ... rest of your existing functions (deleteMediaFile, getFileMetadata) remain the same

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