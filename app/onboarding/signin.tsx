import { signInWithGoogle } from '@/lib/auth/googleAuth';
import { saveProfileToFirestore } from '@/lib/firestore/profileFirestore';
import {
    isOnboardingCompleted,
    isSignedInFlag,
    loadLocalProfile,
    setOnboardingCompleted,
    setSignedIn,
} from '@/lib/profile/profileStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SIGN_IN_DESCRIPTION =
    'Sign in to securely back up your workouts, templates, profile, and sync across devices.';

export default function SignInScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            // Warm up onboarding completion state (so “Skip” works instantly on return)
            try {
                await isOnboardingCompleted();
                await isSignedInFlag();
            } finally {
                if (!mounted) return;
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const handleSkip = async () => {
        try {
            // User skipped sign-in: still mark onboarding completed.
            // Do NOT mark signed-in=true; we want “local mode” later.
            await setOnboardingCompleted();
        } catch {
            // ignore
        }
        router.replace('/');
    };

    const handleContinueWithGoogle = async () => {
        setLoading(true);
        try {
            const user = await signInWithGoogle();

            // Sign-in succeeded; persist signed-in flag
            await setSignedIn();

            // Save profile to Firestore (height/weight/goal) from local onboarding answers
            const p = await loadLocalProfile();
            if (user?.uid && p) {
                await saveProfileToFirestore(user.uid, {
                    name: p.name,
                    heightCm: p.heightCm,
                    weightKg: p.weightKg,
                    goal: p.goal,
                });
            }

            await setOnboardingCompleted();
            router.replace('/');
        } catch (e: any) {
            Alert.alert(
                'Google Sign-In',
                e?.message || 'Sign-in failed. You can skip for now and keep using local storage.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.screen}>
                {router.canGoBack() && (
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                        <Text style={styles.backText}>{'< Back'}</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.header}>
                    <Text style={styles.kicker}>SECURE SYNC</Text>
                    <Text style={styles.title}>Finish setup</Text>
                    <Text style={styles.desc}>{SIGN_IN_DESCRIPTION}</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                        onPress={handleContinueWithGoogle}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.primaryBtnText}>Continue with Google</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipBtn}
                        onPress={handleSkip}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Text style={styles.skipText}>Skip for now</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.finePrint}>
                    You can sign in later when you use cloud sync, restore data, or unlock Pro features.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    screen: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 10 },
    backBtn: { paddingVertical: 6 },
    backText: { color: '#111827', fontWeight: '700' },
    header: { marginTop: 26, gap: 10 },
    kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: '#6B7280' },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.6, color: '#111827' },
    desc: { color: '#6B7280', fontWeight: '600', lineHeight: 18, fontSize: 13 },
    actions: { marginTop: 26, gap: 14 },
    primaryBtn: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnDisabled: { opacity: 0.7 },
    primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.3 },
    skipBtn: {
        height: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipText: { color: '#111827', fontWeight: '900', letterSpacing: 0.3 },
    finePrint: { marginTop: 18, textAlign: 'center', color: '#9CA3AF', fontWeight: '600', fontSize: 12, lineHeight: 16 },
});
