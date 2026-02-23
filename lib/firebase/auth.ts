import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { ADMIN_EMAILS } from '../utils/constants';
import { User } from '../utils/types';

const googleProvider = new GoogleAuthProvider();

export async function ensureUserDocument(user: FirebaseUser, displayName?: string) {
  const userDoc = await getDoc(doc(db, 'users', user.uid));

  if (!userDoc.exists()) {
    const isAdmin = ADMIN_EMAILS.includes(user.email || '');
    const newUser: Omit<User, 'joinedAt' | 'lastActiveAt'> & { joinedAt: any; lastActiveAt: any } = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName || user.displayName || 'Anonymous Citizen',
      photoURL: user.photoURL || '',
      role: isAdmin ? 'admin' : 'citizen',
      xp: 0,
      level: 1,
      levelTitle: 'Newcomer',
      totalComplaints: 0,
      resolvedComplaints: 0,
      upvotesReceived: 0,
      joinedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), newUser);
  }
}

export async function signInWithGoogle(): Promise<void> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDocument(result.user);
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDocument(result.user);
  } catch (error) {
    console.error('Email sign in error:', error);
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<void> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserDocument(result.user, displayName);
  } catch (error) {
    console.error('Email sign up error:', error);
    throw error;
  }
}

export async function setupRecaptcha(containerId: string): Promise<RecaptchaVerifier> {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
}

export async function requestPhoneOTP(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  try {
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
}

export async function verifyPhoneOTP(confirmationResult: ConfirmationResult, otp: string, displayName?: string): Promise<void> {
  try {
    const result = await confirmationResult.confirm(otp);
    await ensureUserDocument(result.user, displayName);
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
