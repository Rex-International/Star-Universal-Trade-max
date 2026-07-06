import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { Profile } from '../lib/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        setProfile({ id: profileSnap.id, ...profileSnap.data() } as Profile);
      } else {
        const newProfile: Omit<Profile, 'id'> = {
          full_name: user?.displayName || '',
          email: user?.email || '',
          role: 'customer',
          verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await setDoc(profileRef, { ...newProfile, created_at: serverTimestamp(), updated_at: serverTimestamp() });
        setProfile({ id: userId, ...newProfile } as Profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createProfile(userId: string, email: string, fullName: string) {
    const profileRef = doc(db, 'profiles', userId);
    const profileData = {
      full_name: fullName,
      email,
      role: 'customer',
      verified: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };
    await setDoc(profileRef, profileData);
    return profileData;
  }

  async function signIn(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return {};
    } catch (error: any) {
      return { error: getErrorMessage(error.code) };
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      const credential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateFirebaseProfile(credential.user, { displayName: fullName });
      await createProfile(credential.user.uid, email, fullName);
      return {};
    } catch (error: any) {
      return { error: getErrorMessage(error.code) };
    }
  }

  async function signInWithGoogle() {
    try {
      const credential: UserCredential = await signInWithPopup(auth, googleProvider);
      const user = credential.user;
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await createProfile(user.uid, user.email || '', user.displayName || 'User');
      }
      return {};
    } catch (error: any) {
      return { error: getErrorMessage(error.code) };
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  }

  async function updateProfile(data: Partial<Profile>) {
    if (!user) return { error: 'Not authenticated' };

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        ...data,
        updated_at: serverTimestamp(),
      });

      if (data.full_name) {
        await updateFirebaseProfile(user, { displayName: data.full_name });
      }

      setProfile((prev) => (prev ? { ...prev, ...data } : null));
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {};
    } catch (error: any) {
      return { error: getErrorMessage(error.code) };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
}
