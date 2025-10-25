import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInAnonymously as firebaseSignInAnonymously,
  onAuthStateChanged,
  updateProfile,
  User,
} from '@react-native-firebase/auth';
import { createOrUpdateUser, updateUserStatus } from '../services/firestoreService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        // Update user status to online
        await updateUserStatus(authUser.uid, 'online');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      // Set user offline when component unmounts
      if (user) {
        updateUserStatus(user.uid, 'offline');
      }
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      await updateProfile(userCredential.user, { displayName: name });

      // Create user document in Firestore
      await createOrUpdateUser(userCredential.user.uid, {
        name,
        email,
        status: 'online',
      });
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInAnonymously = async () => {
    try {
      const userCredential = await firebaseSignInAnonymously(auth);
      const anonymousName = `User${Math.floor(Math.random() * 10000)}`;

      // Create user document in Firestore
      await createOrUpdateUser(userCredential.user.uid, {
        name: anonymousName,
        status: 'online',
      });
    } catch (error) {
      console.error('Anonymous sign in error:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      if (user) {
        await updateUserStatus(user.uid, 'offline');
      }
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut: signOutUser, signInAnonymously }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};