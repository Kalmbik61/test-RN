import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { queryClient } from '@/api/queryClient';
import { WsBridge } from '@/features/_app/WsBridge';
import { AuthProvider } from '@/store/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op */
});

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {
        /* no-op */
      });
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <WsBridge />
      </AuthProvider>
    </QueryClientProvider>
  );
}
