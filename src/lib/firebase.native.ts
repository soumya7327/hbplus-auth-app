import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseError } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

import { firebaseApp } from '@/lib/firebase-app';

function initializeFirebaseAuth(): Auth | null {
  if (!firebaseApp) {
    return null;
  }

  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/already-initialized') {
      return getAuth(firebaseApp);
    }

    throw error;
  }
}

export const auth = initializeFirebaseAuth();
export { firebaseConfigError } from '@/lib/firebase-app';
