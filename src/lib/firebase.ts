import { getAuth, type Auth } from 'firebase/auth';
import { Platform } from 'react-native';

import { firebaseApp } from '@/lib/firebase-app';

function initializeFirebaseAuth(): Auth | null {
  if (!firebaseApp || (Platform.OS === 'web' && typeof window === 'undefined')) {
    return null;
  }

  return getAuth(firebaseApp);
}

export const auth = initializeFirebaseAuth();
export { firebaseConfigError } from '@/lib/firebase-app';
