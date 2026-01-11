import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ac5daa4555b44b89814530571666d4e5',
  appName: 'RodeCerto',
  webDir: 'dist',
  server: {
    url: 'https://ac5daa45-55b4-4b89-8145-30571666d4e5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0b10',
      showSpinner: false
    }
  }
};

export default config;
