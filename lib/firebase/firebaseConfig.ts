import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

export const auth = getAuth(app);

let database;
try {
    database = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
    });
} catch (e) {
    database = getFirestore(app);
}

export const db = database;

