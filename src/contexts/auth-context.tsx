import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { signInWithGoogle as authenticateWithGoogle, signOutGoogleAccount } from '@/lib/google-auth';
import { auth, firebaseConfigError } from '@/lib/firebase';

const ACCESS_DENIED_MESSAGE =
  'Access restricted. Use a verified @hbplus.fit account or the configured local test account.';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  notice: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  createEmailPasswordAccount: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const isLocalDevelopment = __DEV__ && process.env.NODE_ENV !== 'production';

const developmentEmailAllowlist = isLocalDevelopment
    ? new Set(
        (process.env.EXPO_PUBLIC_DEV_AUTH_EMAILS ?? '')
          .split(',')
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean),
      )
    : new Set<string>();

export function hasAllowedEmailDomain(email: string | null | undefined): boolean {
  const normalizedEmail = email?.trim().toLowerCase();
  return Boolean(
    normalizedEmail &&
      (normalizedEmail.endsWith('@hbplus.fit') ||
        developmentEmailAllowlist.has(normalizedEmail)),
  );
}

export function isAuthorizedUser(user: User | null): boolean {
  return Boolean(user?.emailVerified && hasAllowedEmailDomain(user.email));
}

function describeAuthError(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/invalid-email') {
      return 'Enter a valid email address.';
    }
    if (error.code === 'auth/missing-password') {
      return 'Enter your password.';
    }
    if (error.code === 'auth/weak-password') {
      return 'Choose a password with at least 6 characters.';
    }
    if (error.code === 'auth/email-already-in-use') {
      return 'An account already exists for this email. Try signing in instead.';
    }
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found'
    ) {
      return 'The email or password is incorrect.';
    }
    if (error.code === 'auth/too-many-requests') {
      return 'Too many attempts. Wait a while, then try again.';
    }
    if (error.code === 'auth/network-request-failed') {
      return 'A network error interrupted authentication. Check your connection and try again.';
    }
    if (error.code === 'auth/popup-blocked') {
      return 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.';
    }
    if (error.code === 'auth/unauthorized-domain') {
      return 'This website is not authorized for Firebase sign-in. Add its hostname in Firebase Authentication settings.';
    }
    if (error.code === 'auth/operation-not-allowed') {
      return 'This sign-in provider is not enabled for this Firebase project.';
    }
    if (error.code === 'auth/account-exists-with-different-credential') {
      return 'An account already exists with this email using a different sign-in method.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Authentication failed. Please try again.';
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(
    auth !== null || (Platform.OS === 'web' && firebaseConfigError === null),
  );
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(firebaseConfigError);
  const [notice, setNotice] = useState<string | null>(null);
  const creatingEmailAccount = useRef(false);

  useEffect(() => {
    const firebaseAuth = auth;
    if (!firebaseAuth) {
      return;
    }

    return onAuthStateChanged(
      firebaseAuth,
      (currentUser) => {
        setInitializing(false);
        if (currentUser && !isAuthorizedUser(currentUser)) {
          setUser(null);
          if (creatingEmailAccount.current) {
            return;
          }
          setError(ACCESS_DENIED_MESSAGE);
          void firebaseSignOut(firebaseAuth).catch((authError: unknown) => {
            setError(`${ACCESS_DENIED_MESSAGE} Sign-out failed: ${describeAuthError(authError)}`);
          });
          return;
        }

        setUser(currentUser);
        if (currentUser) {
          setError(null);
        }
      },
      (authError) => {
        setUser(null);
        setInitializing(false);
        setError(describeAuthError(authError));
      },
    );
  }, []);

  async function signInWithGoogle() {
    if (!auth) {
      setError(
        firebaseConfigError ??
          'Firebase is not available yet. Please wait a moment and try signing in again.',
      );
      return;
    }

    setError(null);
    setNotice(null);
    setWorking(true);
    try {
      const credential = await authenticateWithGoogle();
      if (!credential) {
        return;
      }

      if (!isAuthorizedUser(credential.user)) {
        try {
          await firebaseSignOut(auth);
          await signOutGoogleAccount();
          setError(ACCESS_DENIED_MESSAGE);
        } catch (signOutError) {
          setError(
            `${ACCESS_DENIED_MESSAGE} Sign-out failed: ${describeAuthError(signOutError)}`,
          );
        }
      }
    } catch (authError) {
      setError(describeAuthError(authError));
    } finally {
      setWorking(false);
    }
  }

  async function signInWithEmailPassword(email: string, password: string) {
    if (!auth) {
      setError(firebaseConfigError ?? 'Firebase is unavailable. Please try again later.');
      return;
    }

    setError(null);
    setNotice(null);
    if (!hasAllowedEmailDomain(email)) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }

    setWorking(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!isAuthorizedUser(credential.user)) {
        await firebaseSignOut(auth);
        setError(ACCESS_DENIED_MESSAGE);
      }
    } catch (authError) {
      setError(describeAuthError(authError));
    } finally {
      setWorking(false);
    }
  }

  async function createEmailPasswordAccount(email: string, password: string) {
    if (!auth) {
      setError(firebaseConfigError ?? 'Firebase is unavailable. Please try again later.');
      return;
    }

    setError(null);
    setNotice(null);
    if (!hasAllowedEmailDomain(email)) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }

    setWorking(true);
    creatingEmailAccount.current = true;
    let accountCreated = false;
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      accountCreated = true;
      await sendEmailVerification(credential.user);
      setNotice(
        'Verification email sent. Verify your email address before signing in.',
      );
    } catch (authError) {
      setError(describeAuthError(authError));
    } finally {
      if (accountCreated) {
        try {
          await firebaseSignOut(auth);
        } catch (signOutError) {
          setNotice(null);
          setError(`Unable to sign out the new account: ${describeAuthError(signOutError)}`);
        }
      }
      creatingEmailAccount.current = false;
      setWorking(false);
    }
  }

  async function sendPasswordReset(email: string) {
    if (!auth) {
      setError(firebaseConfigError ?? 'Firebase is unavailable. Please try again later.');
      return;
    }

    setError(null);
    setNotice(null);
    if (!hasAllowedEmailDomain(email)) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }

    setWorking(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice(
        'If an account exists for that address, a password reset email has been sent.',
      );
    } catch (authError) {
      setError(describeAuthError(authError));
    } finally {
      setWorking(false);
    }
  }

  async function signOut() {
    if (!auth) {
      setError(
        firebaseConfigError ??
          'Firebase is not available yet. Please wait a moment and try signing out again.',
      );
      return;
    }

    setWorking(true);
    setError(null);
    setNotice(null);
    try {
      await firebaseSignOut(auth);
      await signOutGoogleAccount();
      setUser(null);
    } catch (authError) {
      setError(`Unable to sign out cleanly: ${describeAuthError(authError)}`);
    } finally {
      setWorking(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: initializing || working,
        authLoading: initializing,
        error,
        notice,
        signInWithGoogle,
        signInWithEmailPassword,
        createEmailPasswordAccount,
        sendPasswordReset,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
