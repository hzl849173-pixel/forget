import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Unable to activate keep awake',
]);

import { useColorScheme } from '@/hooks/use-color-scheme';
import { WorkoutProvider } from '@/hooks/use-workout-storage';
import { isOnboardingCompleted } from '@/lib/profile/profileStorage';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [decided, setDecided] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const done = await isOnboardingCompleted();
        if (!mounted) return;
        setOnboardingCompleted(done);
      } finally {
        if (mounted) {
          setDecided(true);
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!decided) return;

    if (onboardingCompleted) {
      router.replace('/');
    } else {
      router.replace('/onboarding/brand');
    }
  }, [decided, onboardingCompleted, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <WorkoutProvider>
          <Stack>
            {/* onboarding routes */}
            <Stack.Screen name="onboarding/brand" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/name" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/templates" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/signin" options={{ headerShown: false }} />

            {/* home */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </WorkoutProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

