import { getApps, initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
// @ts-ignore - Metro bundler resolves firebase/auth to react-native field (dist/rn/index.js) which provides getReactNativePersistence
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyAo3VTGtS85NWaowCgjqkWcHDOLaxFJ2zY',
    authDomain: 'forget-gym.firebaseapp.com',
    projectId: 'forget-gym',
    storageBucket: 'forget-gym.firebasestorage.app',
    messagingSenderId: '870975577935',
};

export const app =
    getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

let authInstance;
try {
    authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch (e) {
    authInstance = getAuth(app);
}

export const auth = authInstance;

let database;
try {
    database = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
    });
} catch (e) {
    database = getFirestore(app);
}

export const db = database;
