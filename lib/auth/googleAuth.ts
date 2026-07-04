import { auth } from '@/lib/firebase/firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const provider = new GoogleAuthProvider();

/**
 * Expo note:
 * - signInWithPopup works on web.
 * - On native, Firebase auth typically uses a redirect-based flow.
 *
 * This implementation keeps the app from crashing on platforms
 * where popup/redirect is not supported by showing a controlled error.
 */
export async function signInWithGoogle() {
    try {
        // Web flow
        if (typeof window !== 'undefined') {
            const result = await signInWithPopup(auth, provider);
            return result.user;
        }

        // Native flow is expected to be wired via existing Expo/Firebase Google Auth setup.
        // If the project isn’t configured for native OAuth yet, throw a controlled error.
        throw new Error(
            'Google sign-in is not configured for native in this project. Please configure the existing Expo/Firebase native Google authentication flow.'
        );
    } catch (e: any) {
        // Re-throw with a readable message for UI
        throw new Error(e?.message || 'Google sign-in failed');
    }
}

export async function getCurrentUser() {
    return auth.currentUser;
}

export function isUserSignedIn() {
    return !!auth.currentUser;
}
