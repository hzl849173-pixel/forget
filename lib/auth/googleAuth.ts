import { auth } from '@/lib/firebase/firebaseConfig';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

/**
 * Expo Go Google Sign-In (native auth-session style).
 *
 * IMPORTANT:
 * This repo currently does not include the secure server-side step required to
 * exchange an OAuth authorization code for tokens and then create Firebase
 * credentials. Without that step, this function cannot complete Firebase auth.
 *
 * This implementation keeps the app stable and fails with a controlled message
 * instead of calling web-only APIs like `signInWithPopup`.
 */
export async function signInWithGoogle() {
    try {
        const redirectUri = AuthSession.makeRedirectUri();

        const clientId =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (process as any)?.env?.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

        if (!clientId) {
            throw new Error(
                'Google OAuth is not configured for Expo Go. Please set EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID and configure redirect URIs.'
            );
        }

        const authUrl =
            'https://accounts.google.com/o/oauth2/v2/auth' +
            `?client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            '&response_type=code' +
            '&scope=' +
            encodeURIComponent('openid email profile') +
            '&prompt=select_account';

        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

        if (!result || result.type !== 'success') {
            throw new Error('Google sign-in cancelled.');
        }

        // We intentionally stop here because the secure code->token exchange must be server-side.
        throw new Error(
            'Google sign-in completed OAuth authorization, but secure token exchange for Firebase is not configured yet.'
        );
    } catch (e: any) {
        throw new Error(e?.message || 'Google sign-in failed');
    }
}

export async function getCurrentUser() {
    return auth.currentUser;
}

export function isUserSignedIn() {
    return !!auth.currentUser;
}
