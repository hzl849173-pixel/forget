import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

LogBox.ignoreLogs([
  'Unable to activate keep awake',
]);

import notifee, { EventType, AndroidImportance, TriggerType } from '@notifee/react-native';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS) {
    if (detail.pressAction?.id === 'stop-alarm') {
      try {
        await notifee.cancelNotification('workout-alarm-trigger');
      } catch (e) {}
      try {
        await notifee.cancelNotification('rest-timer-active-ongoing');
      } catch (e) {}
      try {
        await AsyncStorage.removeItem('@workout_rest_timer_target_end');
        await AsyncStorage.removeItem('@workout_rest_timer_duration');
      } catch (e) {}
    } else if (detail.pressAction?.id === 'add-30s') {
      try {
        await notifee.cancelNotification('workout-alarm-trigger');
      } catch (e) {}
      try {
        await notifee.cancelNotification('rest-timer-active-ongoing');
      } catch (e) {}
      try {
        const triggerTime = Date.now() + 30 * 1000;
        await AsyncStorage.setItem('@workout_rest_timer_target_end', String(triggerTime));
        await AsyncStorage.setItem('@workout_rest_timer_duration', '30');
        await notifee.createTriggerNotification(
          {
            id: 'workout-alarm-trigger',
            title: "Time's up! ⏱️",
            body: "Rest period over. Time to start your next set!",
            android: {
              channelId: 'workout-alarm-v11',
              smallIcon: 'notification_icon',
              color: '#10B981',
              importance: AndroidImportance.HIGH,
              sound: 'default',
              vibrationPattern: [100, 500, 250, 500],
              ongoing: true,
              autoCancel: false,
              pressAction: { id: 'default' },
              actions: [
                {
                  title: '+ 30s',
                  pressAction: { id: 'add-30s' },
                },
                {
                  title: 'DISMISS',
                  pressAction: { id: 'stop-alarm' },
                },
              ],
            },
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: triggerTime,
            alarmManager: {
              allowWhileIdle: true,
            },
          }
        );
      } catch (e) {}
    }
  } else if (type === EventType.DISMISSED) {
    try {
      await notifee.cancelNotification('rest-timer-active-ongoing');
    } catch (e) {}
    try {
      await notifee.cancelNotification('workout-alarm-trigger');
    } catch (e) {}
    try {
      await AsyncStorage.removeItem('@workout_rest_timer_target_end');
      await AsyncStorage.removeItem('@workout_rest_timer_duration');
    } catch (e) {}
  }
});

import { useColorScheme } from '@/hooks/use-color-scheme';
import { WorkoutProvider } from '@/hooks/use-workout-storage';
import { isOnboardingCompleted, isSignedInFlag, setOnboardingCompleted as markOnboardingCompleted } from '@/lib/profile/profileStorage';
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
        const onboardingDone = await isOnboardingCompleted();
        const signedIn = await isSignedInFlag();
        const done = onboardingDone || signedIn;
        if (!mounted) return;
        if (done && !onboardingDone) {
          await markOnboardingCompleted();
        }
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
            <Stack.Screen name="onboarding/mode" options={{ headerShown: false }} />
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

