import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyCg-37wlB3jP9mHodx3ybExUpgnkFKzog',
    authDomain: 'we-remember-c7c83.firebaseapp.com',
    projectId: 'we-remember-c7c83',
    storageBucket: 'we-remember-c7c83.firebasestorage.app',
    messagingSenderId: '807515672576',
    appId: '1:807515672576:web:a2da22b5baa3a628d0c8e5',
    measurementId: 'G-DWZFEZRJLS',
};

export const app =
    getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
