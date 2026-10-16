import type { ExpoConfig } from 'expo/config';

import appJson from './app.json';

const baseConfig = appJson.expo as ExpoConfig;

export default function configureApp(): ExpoConfig {
  const plugins = [...(baseConfig.plugins ?? [])];
  const iosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

  if (iosUrlScheme) {
    plugins.push([
      '@react-native-google-signin/google-signin',
      { iosUrlScheme },
    ]);
  }

  return {
    ...baseConfig,
    plugins,
    ios: {
      ...baseConfig.ios,
      ...(process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER
        ? { bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER }
        : {}),
    },
    android: {
      ...baseConfig.android,
      ...(process.env.EXPO_PUBLIC_ANDROID_PACKAGE
        ? { package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE }
        : {}),
    },
  };
}
