import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { createOrUpdateUser, updateUserStatus } from '../services/firestoreService';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (authUser) => {
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
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      // Update display name
      await userCredential.user.updateProfile({ displayName: name });

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
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInAnonymously = async () => {
    try {
      const userCredential = await auth().signInAnonymously();
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

  const signOut = async () => {
    try {
      if (user) {
        await updateUserStatus(user.uid, 'offline');
      }
      await auth().signOut();
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, signInAnonymously }}>
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
