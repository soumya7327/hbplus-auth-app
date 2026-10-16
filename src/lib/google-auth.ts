import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

export async function signInWithGoogle(): Promise<UserCredential | null> {
  if (!auth) {
    throw new Error('Firebase is not configured. Add the required EXPO_PUBLIC_FIREBASE_* values.');
  }

  try {
    return await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error.code)
    ) {
      return null;
    }
    throw error;
  }
}

export function signOutGoogleAccount(): Promise<void> {
  return Promise.resolve();
}
