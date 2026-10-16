import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  type UserCredential,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

function configureGoogleSignIn() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  if (!webClientId || !iosClientId) {
    throw new Error(
      'Native Google Sign-In needs EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.',
    );
  }

  GoogleSignin.configure({ webClientId, iosClientId });
}

export async function signInWithGoogle(): Promise<UserCredential | null> {
  if (!auth) {
    throw new Error('Firebase is not configured. Add the required EXPO_PUBLIC_FIREBASE_* values.');
  }

  configureGoogleSignIn();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') {
      return null;
    }
    if (!response.data.idToken) {
      throw new Error('Google did not return an ID token. Check your OAuth client configuration.');
    }

    const credential = GoogleAuthProvider.credential(response.data.idToken);
    return await signInWithCredential(auth, credential);
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      return null;
    }
    throw error;
  }
}

export async function signOutGoogleAccount() {
  if (GoogleSignin.getCurrentUser()) {
    await GoogleSignin.signOut();
  }
}
