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
      console.log('🔔 Auth state changed:', authUser ? `User: ${authUser.uid}` : 'No user (logged out)');
      if (authUser) {
        setUser(authUser);
        // Update user status to online
        await updateUserStatus(authUser.uid, 'online');
      } else {
        console.log('👋 Setting user to null, should show AuthScreen now...');
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
      console.log('🔐 Starting sign up process...');
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('✅ Firebase Auth user created:', userCredential.user.uid);

      // Update display name
      await userCredential.user.updateProfile({ displayName: name });
      console.log('✅ Display name updated');

      // Create user document in Firestore
      console.log('📝 About to create Firestore user document...');
      await createOrUpdateUser(userCredential.user.uid, {
        name,
        email,
        status: 'online',
      });
      console.log('✅ Sign up process completed!');
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
      console.log('🚪 Starting sign out process...');
      if (user) {
        console.log('📊 Updating user status to offline...');
        await updateUserStatus(user.uid, 'offline');
      }
      console.log('🔐 Signing out from Firebase Auth...');
      await auth().signOut();
      console.log('✅ Sign out successful!');
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
