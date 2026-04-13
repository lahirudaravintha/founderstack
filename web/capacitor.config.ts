import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f6407e50612c40bd879be75888061b26',
  appName: 'FounderLedger',
  webDir: 'dist',
  server: {
    url: 'https://f6407e50-612c-40bd-879b-e75888061b26.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
