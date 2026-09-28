import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Unable to activate keep awake',
]);

import notifee, { EventType } from '@notifee/react-native';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'stop-alarm') {
    try {
      await notifee.cancelNotification('workout-alarm-trigger');
    } catch (e) {}
    try {
      await notifee.cancelNotification('rest-timer-active-ongoing');
    } catch (e) {}
  } else if (type === EventType.DISMISSED) {
    try {
      await notifee.cancelNotification('rest-timer-active-ongoing');
    } catch (e) {}
    try {
      await notifee.cancelNotification('workout-alarm-trigger');
    } catch (e) {}
  }
});

import { useColorScheme } from '@/hooks/use-color-scheme';
import { WorkoutProvider } from '@/hooks/use-workout-storage';
import { isOnboardingCompleted } from '@/lib/profile/profileStorage';
import { useAppVersionCheck } from '@/lib/updates/versionCheck';
import { AppUpdateModal } from '@/components/updates/AppUpdateModal';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [decided, setDecided] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const appUpdateState = useAppVersionCheck();

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
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!decided) return;

    SplashScreen.hideAsync().catch(() => {});

    if (!onboardingCompleted) {
      router.replace('/onboarding/brand');
    }
  }, [decided, onboardingCompleted, router]);

  if (!decided) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <WorkoutProvider>
          <Stack initialRouteName={onboardingCompleted ? 'index' : 'onboarding/brand'}>
            {/* onboarding routes */}
            <Stack.Screen name="onboarding/brand" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/name" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/weight" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/signin" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/templates" options={{ headerShown: false }} />

            {/* home */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
          <AppUpdateModal
            updateState={appUpdateState}
            onDismissOptional={appUpdateState.dismissOptionalUpdate}
            onOpenUpdate={appUpdateState.openUpdateUrl}
          />
        </WorkoutProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

