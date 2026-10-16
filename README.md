# HB+ Intern Assessment App

A cross-platform authentication app built with Expo, React Native, React Native Web, and Firebase Authentication. It supports Google sign-in, email/password sign-in, password reset, and protected dashboard access.

## Live Demo

- **Live app:** https://hbplus-intern-assessment.netlify.app/
- **GitHub repository:** https://github.com/soumya7327/hbplus-auth-app

## Features

- Google sign-in using Firebase Authentication
- Email/password sign-in and password-reset flow
- Protected dashboard with sign-out
- Verified-email access policy for `@hbplus.fit` accounts
- Local-development-only test email allowlist
- Expo Router navigation for web and native platforms
- Static web deployment support through Netlify

## Technology Stack

| Technology | Purpose |
|---|---|
| Expo SDK 57 | App development and web export |
| React Native / React Native Web | Cross-platform user interface |
| TypeScript | Typed application code |
| Expo Router | File-based routing and protected screens |
| Firebase Authentication | User authentication and email verification |
| Netlify | Hosting the web app |

## Screenshots

Add actual screenshots from your app to the paths below to display them here.

| Sign-in screen | Dashboard |
|---|---|
| `docs/screenshots/sign-in.png` | `docs/screenshots/dashboard.png` |

When you add the image files, you can use these Markdown links instead:

```markdown
![Sign-in screen](docs/screenshots/sign-in.png)
![Dashboard](docs/screenshots/dashboard.png)
```

## Requirements

- Node.js and npm
- An Expo SDK 57 compatible development environment
- A Firebase project with Google and Email/Password enabled under **Authentication → Sign-in method**
- Google OAuth client IDs and, for native builds, registered app identifiers
- A development build for iOS or Android; native Google Sign-In is not available in Expo Go

## Run the App Locally

**1. Clone the repository**

```bash
git clone https://github.com/soumya7327/hbplus-auth-app.git
cd hbplus-auth-app
```

**2. Install dependencies first**

```bash
npm install
```

**3. Configure environment variables**

Copy `.env.example` to `.env.local` and replace the placeholders with values from Firebase Console and Google Cloud Console. Do not commit `.env.local`.

Firebase web configuration values use the `EXPO_PUBLIC_FIREBASE_*` variables. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to the OAuth **Web application** client ID and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` to the OAuth **iOS** client ID. These client IDs are public identifiers, not client secrets.

Set the native application identifiers to match the apps registered for the Firebase/Google project:

- `EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER`: iOS app bundle ID
- `EXPO_PUBLIC_ANDROID_PACKAGE`: Android application ID/package name
- `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`: the iOS OAuth client's `REVERSED_CLIENT_ID`

**4. Start the Expo web app**

```bash
npx expo start --web
```

When Expo starts successfully, open the local URL shown in your terminal in your browser.

## Firebase and Google Sign-In Setup

1. Create or open the Firebase project.
2. Enable **Google** and **Email/Password** under **Authentication → Sign-in method**.
3. Add `localhost` and the production website hostname under **Authentication → Settings → Authorized domains**.
4. In Google Cloud Console, configure the OAuth Web client with the Firebase Auth handler as an authorized redirect URI: `https://<your-firebase-auth-domain>/__/auth/handler`.

Web Google sign-in uses Firebase `signInWithPopup`. Email/password sign-in and password reset use Firebase Authentication.

The login screen intentionally has no account-creation control. The registration action accepts `@hbplus.fit` addresses and, in local development only, an exact address from `EXPO_PUBLIC_DEV_AUTH_EMAILS`. It sends a verification email and signs out until the address is verified.

### Native Google Sign-In (Optional)

Native sign-in uses a Google ID token exchanged for a Firebase credential. Register the Android package and signing-certificate SHA-1 fingerprint(s) in Firebase/Google Cloud, and register the matching iOS bundle ID and OAuth client. After native dependencies or app configuration change, create/rebuild a development build:

```bash
npx expo run:android
```

On macOS, run `npx expo run:ios`. For iOS from Windows, use an EAS development build. Expo Go cannot load the native Google Sign-In module.

## Access Policy and Security

Access requires a verified Firebase email ending exactly in `@hbplus.fit`; the comparison is case-insensitive. For local development only, `EXPO_PUBLIC_DEV_AUTH_EMAILS` accepts a comma-separated list of exact email addresses, matched case-insensitively. The exception is enabled only when `__DEV__` is true and `NODE_ENV` is not `production`.

Set any local test address in your ignored `.env.local`; `.env.example` should contain only a placeholder. Production builds always require a verified `@hbplus.fit` email and ignore the local allowlist. Other users are signed out and shown an access-restricted message.

Expo Router protects `/dashboard`. A client-side route guard improves navigation but is not backend authorization.

`firestore.rules` is stricter than the local client exception and allows Firestore reads and writes only for verified `@hbplus.fit` accounts. The local Gmail allowlist never grants Firestore access. Enable Firestore for the Firebase project, then deploy the rules with the Firebase CLI:

```bash
npx firebase-tools deploy --only firestore:rules
```

The rules require a signed-in account with a verified `@hbplus.fit` email. They do not protect other backends; validate Firebase ID tokens and the same verified email claim in any API or Cloud Function before serving protected data. The app currently has no Firestore data model.

## Manual Authentication Checks

- Sign in with an authorized Google account and confirm `/dashboard` shows that account's email.
- Sign in with an unauthorized Google account and confirm access is denied and the account is signed out. Outside local development, this includes personal Gmail.
- Confirm non-allowlisted personal Gmail and other non-`@hbplus.fit` addresses are rejected for email/password sign-in and password reset.
- If invoking account registration, confirm non-allowlisted addresses are rejected before Firebase account creation and allowed registration sends a verification email; confirm the new session is signed out.
- Try signing in with an unverified `@hbplus.fit` account and confirm the dashboard remains protected.
- Request a password reset for an `@hbplus.fit` email and confirm the generic confirmation message is shown.
- Sign out from the dashboard and confirm `/dashboard` is no longer accessible.
- In development, add your exact test address to `EXPO_PUBLIC_DEV_AUTH_EMAILS` in `.env.local`, restart Expo, verify the address, and confirm sign-in and dashboard access work. Confirm Firestore access is still denied for that account.
- In a production build, confirm that only verified `@hbplus.fit` accounts can access the dashboard.

## Web Deployment (Netlify)

The app is deployed on Netlify at https://hbplus-intern-assessment.netlify.app/.

The static web bundle can be created with:

```bash
npx expo export --platform web
```

The generated `dist/` directory is published by Netlify. Configure the same `EXPO_PUBLIC_FIREBASE_*` and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` variables in the hosting/build environment, add the deployed hostname to Firebase Authentication's authorized domains, and ensure client-side routes serve the appropriate exported pages.

## Author

**Soumya Jena**  
GitHub: https://github.com/soumya7327
