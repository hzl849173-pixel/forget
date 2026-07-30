import { auth } from '@/lib/firebase/firebaseConfig';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, User as FirebaseUser } from 'firebase/auth';
import { Platform } from 'react-native';

console.log("[googleAuth] Module is loading...");
console.log("[googleAuth] Platform:", Platform.OS);
console.log("[googleAuth] Installed package version: 16.1.2");

const webClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
const iosClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS;
const androidClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_ANDROID;

console.log("[googleAuth] Required environment variables exist status:");
console.log("  EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID exists:", !!webClientIdEnv);
console.log("  EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS exists:", !!iosClientIdEnv);
console.log("  EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_ANDROID exists:", !!androidClientIdEnv);

function maskClientId(clientId: string | undefined): string {
    if (!clientId) return 'UNDEFINED';
    if (clientId.length < 10) return 'TOO_SHORT';
    return `${clientId.substring(0, 5)}...${clientId.substring(clientId.length - 5)}`;
}

let isGoogleConfigured = false;

console.log("[googleAuth] Google Web Client ID being used at initialization:", maskClientId(webClientIdEnv));

// Configure Google Sign-In with webClientId if available at initialization
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
if (webClientId) {
    console.log('[googleAuth] Initializing module-level GoogleSignin.configure with client ID:', maskClientId(webClientId));
    try {
        console.log("[STEP] Starting GoogleSignin.configure()");
        GoogleSignin.configure({
            webClientId,
        });
        isGoogleConfigured = true;
        console.log("[STEP] GoogleSignin.configure() completed");
    } catch (error: any) {
        console.error('[googleAuth] Module-level GoogleSignin.configure failed:', error);
        console.error("GOOGLE ERROR OBJECT:", error);
        try {
            console.error("GOOGLE ERROR JSON:", JSON.stringify(error, null, 2));
        } catch (e) {
            console.error("GOOGLE ERROR JSON (fallback): Stringification failed.");
        }
        console.error("GOOGLE ERROR CODE:", error?.code);
        console.error("GOOGLE ERROR MESSAGE:", error?.message);
        console.error("GOOGLE ERROR NAME:", error?.name);
        console.error("GOOGLE ERROR STACK:", error?.stack);
        console.error("GOOGLE ERROR KEYS:", Object.keys(error || {}));
    }
} else {
    console.warn('[googleAuth] Module-level webClientId not found at initialization.');
}

/**
 * Custom React Hook for Google Sign-In using the native SDK.
 */
export function useGoogleSignIn() {
    const signInWrapper = async (): Promise<FirebaseUser | null> => {
        return signIn();
    };

    const signOutWrapper = async (): Promise<void> => {
        return signOutFromGoogle();
    };

    return {
        signIn: signInWrapper,
        signOut: signOutWrapper,
    };
}

/**
 * Signs out of Google Sign-in to clear the cached user session.
 */
export async function signOutFromGoogle(): Promise<void> {
    try {
        const clientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
        if (clientId && !isGoogleConfigured) {
            console.log("[googleAuth] Configuring GoogleSignin lazily inside signOutFromGoogle...");
            GoogleSignin.configure({
                webClientId: clientId,
            });
            isGoogleConfigured = true;
        }
    } catch (configError) {
        console.error("[googleAuth] GoogleSignin.configure failed in signOutFromGoogle:", configError);
    }



    try {
        console.log("[googleAuth] Starting GoogleSignin.signOut()...");
        await GoogleSignin.signOut();
        console.log("[googleAuth] GoogleSignin.signOut() completed.");
    } catch (error) {
        console.error("[googleAuth] Error in GoogleSignin.signOut():", error);
    }
}

/**
 * Performs Google Sign-In using the native SDK and signs in with Firebase.
 * @returns The Firebase authenticated user.
 */
export async function signIn(): Promise<FirebaseUser | null> {
    console.log("[googleAuth] signIn() initiated.");
    let lastStep = "NONE";
    try {
        const clientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
        console.log("[googleAuth] Runtime EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID:", maskClientId(clientId));
        if (!clientId) {
            throw new Error('Google Sign-In configuration error: EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID is not defined in your environment.');
        }

        // Step 1: Configure Google Sign-In
        console.log("[STEP 1] Configure Google Sign-In");
        if (!isGoogleConfigured) {
            console.log("[STEP] Starting GoogleSignin.configure() lazily in signIn()");
            GoogleSignin.configure({
                webClientId: clientId,
            });
            isGoogleConfigured = true;
            console.log("[STEP] GoogleSignin.configure() completed");
        } else {
            console.log("[STEP] GoogleSignin already configured, skipping re-configure");
        }
        lastStep = "[STEP 1] Configure Google Sign-In Completed";

        // Step 2: Check Play Services
        console.log("[STEP 2] Check Play Services");
        console.log("[STEP] Starting GoogleSignin.hasPlayServices()");
        const playServicesAvailable = await GoogleSignin.hasPlayServices();
        console.log("[googleAuth] Play Services are available:", playServicesAvailable);
        console.log("[STEP] GoogleSignin.hasPlayServices() completed");
        lastStep = "[STEP 2] Check Play Services Completed";



        // Step 3: Start Google Sign-In
        console.log("[STEP 3] Start Google Sign-In");
        console.log("[STEP] Starting GoogleSignin.signIn()");
        const response = await GoogleSignin.signIn();
        console.log("[STEP] GoogleSignin.signIn() completed");
        lastStep = "[STEP 3] Start Google Sign-In Completed";

        // Step 4: Received Google Response
        console.log("[STEP 4] Received Google Response");
        console.log("Google Response:", JSON.stringify(response, null, 2));
        console.log("Google Response Raw:", response);
        if (response && response.type) {
            console.log("[googleAuth] GoogleSignin.signIn() response type:", response.type);
        } else {
            console.log("[googleAuth] GoogleSignin.signIn() response type: undefined/unknown");
        }
        lastStep = "[STEP 4] Received Google Response Completed";

        if (response.type === 'success') {
            console.log("[googleAuth] GoogleSignin.signIn() returned: success");
            
            // Step 5: Extract ID Token
            console.log("[STEP 5] Extract ID Token");
            const idToken = response.data.idToken;
            console.log("ID Token:", idToken ? "FOUND" : "MISSING");
            lastStep = "[STEP 5] Extract ID Token Completed";

            if (!idToken) {
                const error = new Error('Google sign-in succeeded, but no ID token was returned.');
                console.error("[googleAuth] Throwing exception:", error.message);
                throw error;
            }

            // Step 6: Create Firebase Credential
            console.log("[STEP 6] Create Firebase Credential");
            console.log("[STEP] Starting GoogleAuthProvider.credential()");
            const credential = GoogleAuthProvider.credential(idToken);
            console.log("[STEP] GoogleAuthProvider.credential() completed");
            lastStep = "[STEP 6] Create Firebase Credential Completed";

            // Step 7: Firebase Sign-In Complete
            console.log("[STEP 7] Firebase Sign-In Complete");
            console.log("[STEP] Starting signInWithCredential()");
            const userCredential = await signInWithCredential(auth, credential);
            console.log("[STEP] signInWithCredential() completed");
            
            console.log("Firebase UID:", userCredential.user.uid);
            console.log("Firebase Email:", userCredential.user.email);
            console.log("Firebase Display Name:", userCredential.user.displayName);
            
            lastStep = "[STEP 7] Firebase Sign-In Complete (Entire Flow Success)";
            return userCredential.user;
        } else if (response.type === 'cancelled') {
            console.log("[googleAuth] GoogleSignin.signIn() returned: cancelled");
            return null;
        } else {
            console.log("[googleAuth] GoogleSignin.signIn() returned: unknown");
            const error = new Error('Google sign-in failed: Unknown response status.');
            console.error("[googleAuth] Throwing exception:", error.message);
            throw error;
        }
    } catch (error: any) {
        if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log("[googleAuth] GoogleSignin.signIn() threw SIGN_IN_CANCELLED (user cancellation)");
            return null;
        }
        console.log("[googleAuth] GoogleSignin.signIn() returned: exception");
        console.log("[googleAuth] Last successful step before failure:", lastStep);
        console.error("GOOGLE ERROR OBJECT:", error);
        try {
            console.error("GOOGLE ERROR JSON:", JSON.stringify(error, null, 2));
        } catch (e) {
            console.error("GOOGLE ERROR JSON (fallback): Stringification failed.");
        }
        console.error("GOOGLE ERROR CODE:", error?.code);
        console.error("GOOGLE ERROR MESSAGE:", error?.message);
        console.error("GOOGLE ERROR NAME:", error?.name);
        console.error("GOOGLE ERROR STACK:", error?.stack);
        console.error("GOOGLE ERROR KEYS:", Object.keys(error || {}));
        throw error;
    }
}

/**
 * Gets the currently authenticated Firebase user.
 */
export async function getCurrentUser(): Promise<FirebaseUser | null> {
    return auth.currentUser;
}

/**
 * Checks if a user is currently signed in.
 */
export function isUserSignedIn(): boolean {
    return !!auth.currentUser;
}
