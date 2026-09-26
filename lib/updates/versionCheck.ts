import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';

const REMOTE_CONFIG_INSTANCE_KEY = '@forget_remote_config_instance_id';
const DISMISSED_OPTIONAL_VERSION_KEY = '@forget_dismissed_optional_version';

// Project credentials from Firebase setup
const FIREBASE_PROJECT_NUMBER = '870975577935';
const FIREBASE_API_KEY = 'AIzaSyAo3VTGtS85NWaowCgjqkWcHDOLaxFJ2zY';
const FIREBASE_APP_ID = '1:870975577935:android:f8cd26ad2c606a9f14af3a';

export interface RemoteConfigValues {
  latest_version: string;
  minimum_version: string;
  update_url: string;
}

export type UpdateStatus = 'checking' | 'current' | 'optional_update' | 'mandatory_update' | 'error';

export interface AppUpdateState {
  status: UpdateStatus;
  currentVersion: string;
  latestVersion: string;
  minimumVersion: string;
  updateUrl: string;
  isDismissed: boolean;
}

/**
 * Reliable semantic version comparison.
 * Returns:
 *  -1 if v1 < v2
 *   0 if v1 === v2
 *   1 if v1 > v2
 */
export function compareSemver(v1: string, v2: string): number {
  if (!v1 && !v2) return 0;
  if (!v1) return -1;
  if (!v2) return 1;

  const clean1 = v1.split('-')[0].trim();
  const clean2 = v2.split('-')[0].trim();

  const parts1 = clean1.split('.').map((n) => parseInt(n, 10) || 0);
  const parts2 = clean2.split('.').map((n) => parseInt(n, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length, 3);
  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] ?? 0;
    const num2 = parts2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

async function getOrCreateAppInstanceId(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(REMOTE_CONFIG_INSTANCE_KEY);
    if (stored) return stored;
    const newId = Crypto.randomUUID().replace(/-/g, '').substring(0, 32);
    await AsyncStorage.setItem(REMOTE_CONFIG_INSTANCE_KEY, newId);
    return newId;
  } catch {
    return '00000000000000000000000000000001';
  }
}

/**
 * Fetches Remote Config values directly from Firebase Remote Config REST endpoint.
 * Highly resilient, zero IndexedDB dependency, with a 5-second network timeout.
 */
export async function fetchRemoteConfig(): Promise<RemoteConfigValues | null> {
  try {
    const appInstanceId = await getOrCreateAppInstanceId();
    const url = `https://firebaseremoteconfig.googleapis.com/v1/projects/${FIREBASE_PROJECT_NUMBER}/namespaces/firebase:fetch?key=${FIREBASE_API_KEY}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: FIREBASE_APP_ID,
        appInstanceId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data || !data.entries) {
      return null;
    }

    const entries = data.entries;
    return {
      latest_version: (entries.latest_version || '').trim(),
      minimum_version: (entries.minimum_version || '').trim(),
      update_url: (entries.update_url || '').trim(),
    };
  } catch (err) {
    // Network offline or timeout - fail gracefully without blocking user
    return null;
  }
}

/**
 * Checks for EAS OTA JavaScript updates in the background.
 */
export async function checkEASUpdate(): Promise<void> {
  if (__DEV__) return;
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      // Update is cached and will apply on the next app restart
    }
  } catch {
    // Silent failover
  }
}

/**
 * Hook to manage app updates and version gating on startup.
 */
export function useAppVersionCheck() {
  const currentVersion = Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';

  const [state, setState] = useState<AppUpdateState>({
    status: 'checking',
    currentVersion,
    latestVersion: currentVersion,
    minimumVersion: currentVersion,
    updateUrl: '',
    isDismissed: false,
  });

  useEffect(() => {
    let mounted = true;

    async function checkVersion() {
      // Trigger background EAS Update check for OTA JS changes
      checkEASUpdate().catch(() => {});

      const config = await fetchRemoteConfig();
      if (!mounted) return;

      if (!config || (!config.latest_version && !config.minimum_version)) {
        setState((prev) => ({ ...prev, status: 'current' }));
        return;
      }

      const { latest_version, minimum_version, update_url } = config;

      // 1. Mandatory Check: installed < minimum_version
      if (minimum_version && compareSemver(currentVersion, minimum_version) < 0) {
        setState({
          status: 'mandatory_update',
          currentVersion,
          latestVersion: latest_version || minimum_version,
          minimumVersion: minimum_version,
          updateUrl: update_url,
          isDismissed: false,
        });
        return;
      }

      // 2. Optional Check: installed < latest_version
      if (latest_version && compareSemver(currentVersion, latest_version) < 0) {
        // Check if user already dismissed this specific version in this session
        const dismissedVer = await AsyncStorage.getItem(DISMISSED_OPTIONAL_VERSION_KEY);
        const isDismissed = dismissedVer === latest_version;

        setState({
          status: 'optional_update',
          currentVersion,
          latestVersion: latest_version,
          minimumVersion: minimum_version || currentVersion,
          updateUrl: update_url,
          isDismissed,
        });
        return;
      }

      // 3. Up to date
      setState({
        status: 'current',
        currentVersion,
        latestVersion: latest_version || currentVersion,
        minimumVersion: minimum_version || currentVersion,
        updateUrl: update_url,
        isDismissed: false,
      });
    }

    checkVersion();

    return () => {
      mounted = false;
    };
  }, [currentVersion]);

  const dismissOptionalUpdate = async () => {
    try {
      await AsyncStorage.setItem(DISMISSED_OPTIONAL_VERSION_KEY, state.latestVersion);
    } catch {}
    setState((prev) => ({ ...prev, isDismissed: true }));
  };

  const openUpdateUrl = async () => {
    if (!state.updateUrl) return;
    try {
      await Linking.openURL(state.updateUrl);
    } catch (e) {
      console.warn('Failed to open update URL:', e);
    }
  };

  return {
    ...state,
    dismissOptionalUpdate,
    openUpdateUrl,
  };
}
