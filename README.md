# HB+ Intern Assessment App

Cross-platform Google sign-in for Expo, React Native, and React Native Web, backed by Firebase Authentication.

## Requirements

- Node.js and npm
- An Expo SDK 57 compatible development environment
- A Firebase project with Google and Email/Password enabled under **Authentication → Sign-in method**
- Google OAuth client IDs and, for native builds, registered app identifiers
- A development build for iOS or Android; native Google Sign-In is not available in Expo Go

## Local configuration

Copy `.env.example` to `.env.local` and replace the placeholders with values from Firebase Console and Google Cloud Console. Do not commit `.env.local`.

Firebase web configuration keys (`EXPO_PUBLIC_FIREBASE_*`) are used by the Firebase JavaScript SDK. The `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is the OAuth **Web application** client ID; `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` is the OAuth **iOS** client ID. These client IDs are public identifiers, not client secrets.

Set the native application identifiers to exactly match the apps registered for this Firebase/Google project:

- `EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER`: iOS app bundle ID
- `EXPO_PUBLIC_ANDROID_PACKAGE`: Android application ID/package name
- `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`: the iOS OAuth client's `REVERSED_CLIENT_ID`, used by the Google Sign-In config plugin

The native Google Sign-In package is configured in `app.config.ts` from these values. The iOS config plugin is only applied when `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` is set.

## Run the app

```bash
npm install
npx expo start --web
```

Web Google sign-in uses Firebase `signInWithPopup`. Add `localhost` and the production website hostname to **Firebase Authentication → Settings → Authorized domains**.

Email/password sign-in and password reset use Firebase Authentication. Enable the Email/Password provider in Firebase Console to use these flows. The login screen intentionally has no account-creation control; the registration action accepts `@hbplus.fit` addresses and, in local development only, an exact address from `EXPO_PUBLIC_DEV_AUTH_EMAILS`. It sends a verification email and signs out until the address is verified.

In Google Cloud Console, configure the OAuth Web client with the Firebase Auth handler as an authorized redirect URI: `https://<your-firebase-auth-domain>/__/auth/handler`.

Native Google sign-in gets a Google ID token and exchanges it for a Firebase credential. Register the Android package and signing certificate SHA-1 fingerprint(s) in Firebase/Google Cloud, and register the matching iOS bundle ID and OAuth client. After native dependencies or app configuration change, create/rebuild a development build:

```bash
npx expo run:android
```

On macOS, run `npx expo run:ios`; for iOS from Windows, use an EAS development build. Expo Go cannot load the native Google Sign-In module.

## Access policy and protected routes

Access requires a verified Firebase email ending exactly in `@hbplus.fit`; the comparison is case-insensitive. For local development only, `EXPO_PUBLIC_DEV_AUTH_EMAILS` accepts a comma-separated list of exact email addresses, matched case-insensitively. The exception is enabled only when `__DEV__` is true and `NODE_ENV` is not `production`. Set the local test address in your ignored `.env.local`; `.env.example` contains only a placeholder. The allowlist applies to Google sign-in, email/password sign-in, account registration, password reset, restored sessions, and the protected dashboard, but still requires Firebase to report the account email as verified. Production builds always require verified `@hbplus.fit` email and ignore the allowlist. Other users are signed out and shown an access-restricted message. Expo Router protects `/dashboard`; a client-side route guard is useful for navigation but is not backend authorization.

`firestore.rules` remains stricter than the local client exception and allows Firestore reads and writes only for verified `@hbplus.fit` accounts. The local Gmail allowlist never grants Firestore access. Enable Firestore for the Firebase project, then deploy the rules with the Firebase CLI:

```bash
npx firebase-tools deploy --only firestore:rules
```

The rules require a signed-in account with a verified `@hbplus.fit` email. They do not protect other backends; validate Firebase ID tokens and the same verified email claim in any API or Cloud Function before serving protected data. The app currently has no Firestore data model.

## Manual authentication checks

- Sign in with an authorized Google account and confirm `/dashboard` shows that account's email.
- Sign in with an unauthorized Google account and confirm access is denied and the account is signed out. Outside local development, this includes personal Gmail.
- Confirm non-allowlisted personal Gmail and other non-`@hbplus.fit` addresses are rejected for email/password sign-in and password reset.
- If invoking account registration, confirm non-allowlisted addresses are rejected before Firebase account creation and allowed registration sends a verification email; confirm the new session is signed out.
- Try signing in with an unverified `@hbplus.fit` account and confirm the dashboard remains protected.
- Request a password reset for an `@hbplus.fit` email and confirm the generic confirmation message is shown.
- Sign out from the dashboard and confirm `/dashboard` is no longer accessible.
- In development, add your exact test Gmail address to `EXPO_PUBLIC_DEV_AUTH_EMAILS` in `.env.local`, restart Expo, verify the address, and confirm sign-in and dashboard access work. Confirm Firestore access is still denied for that Gmail account.
- In a production build, confirm that same Gmail address is denied and only verified `@hbplus.fit` accounts can access the dashboard.

## Web deployment

Create the static web bundle with:

```bash
npx expo export --platform web
```

Deploy the generated `dist/` directory to a static host. Configure the same `EXPO_PUBLIC_FIREBASE_*` and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` variables in the hosting/build environment, add the deployed hostname to Firebase Authentication's authorized domains, and configure the host to serve the app's entry point for client-side routes.
