import { NativeModules, Platform } from 'react-native';

interface DocumentPermissionModule {
  takePersistableUriPermission(uri: string): Promise<boolean>;
  releasePersistableUriPermission(uri: string): Promise<boolean>;
}

const { DocumentPermission } = NativeModules;

export const takePersistableUriPermission = async (uri: string): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true; // iOS doesn't need this
  }

  try {
    if (!DocumentPermission) {
      console.warn('DocumentPermission native module not found');
      return false;
    }

    await DocumentPermission.takePersistableUriPermission(uri);
    return true;
  } catch (error) {
    console.error('Error taking persistable URI permission:', error);
    return false;
  }
};

export const releasePersistableUriPermission = async (uri: string): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    if (!DocumentPermission) {
      console.warn('DocumentPermission native module not found');
      return false;
    }

    await DocumentPermission.releasePersistableUriPermission(uri);
    return true;
  } catch (error) {
    console.error('Error releasing persistable URI permission:', error);
    return false;
  }
};
