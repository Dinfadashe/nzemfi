import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'NzemFi',
  slug: 'nzemfi',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0a0a0f',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.nzemfi.app',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription: 'NzemFi uses your camera for identity verification (KYC) to ensure one account per person.',
      NSMicrophoneUsageDescription: 'NzemFi requires microphone access for KYC liveness detection.',
    },
    associatedDomains: ['applinks:nzemfi.com'],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0a0a0f',
    },
    package: 'com.nzemfi.app',
    versionCode: 1,
    permissions: [
      'CAMERA',
      'RECORD_AUDIO',
      'FOREGROUND_SERVICE',
      'WAKE_LOCK',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: 'nzemfi.com' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#7c3aed',
        sounds: [],
      },
    ],
    [
      'expo-camera',
      { cameraPermission: 'NzemFi uses your camera for identity verification (KYC).' },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    nzmContractAddress: process.env.EXPO_PUBLIC_NZM_CONTRACT_ADDRESS,
    bscRpcUrl: process.env.EXPO_PUBLIC_BSC_RPC_URL,
    eas: { projectId: 'your-eas-project-id' },
  },
});
