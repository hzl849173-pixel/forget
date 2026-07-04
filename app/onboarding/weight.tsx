import type { FitnessGoal, OnboardingProfile } from '@/lib/profile/profileStorage';
import { loadLocalProfile, saveLocalProfile } from '@/lib/profile/profileStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WeightScreen() {
    const router = useRouter();
    const [weightStr, setWeightStr] = useState('');
    const [loading, setLoading] = useState(true);

    const [goal, setGoal] = useState<FitnessGoal>('Balanced Fitness');
    const [heightCm, setHeightCm] = useState<number>(170);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const p = await loadLocalProfile();
            if (!mounted) return;
            if (p) {
                setGoal(p.goal);
                setHeightCm(p.heightCm);
                setWeightStr(String(p.weightKg));
            }
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const weightKg = useMemo(() => Number(weightStr), [weightStr]);
    const canContinue = Number.isFinite(weightKg) && weightKg >= 35 && weightKg <= 250;

    const handleNext = async () => {
        setError(null);
        if (!canContinue) {
            setError('Enter a valid weight between 35 and 250 kg.');
            return;
        }
        const next: Omit<OnboardingProfile, 'updatedAt'> = {
            heightCm,
            weightKg,
            goal,
        };
        await saveLocalProfile(next);
        router.push('/onboarding/goal');
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
                    <Text style={styles.kicker}>WEIGHT</Text>
                    <Text style={styles.title}>What’s your weight?</Text>
                    <Text style={styles.subtitle}>Just to personalize your progress insights.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputCard}>
                        <Text style={styles.inputLabel}>Weight (kg)</Text>
                        <TextInput
                            value={weightStr}
                            onChangeText={(t) => setWeightStr(t.replace(/[^\d.]/g, ''))}
                            keyboardType="numeric"
                            style={styles.input}
                            placeholder="e.g. 72"
                            placeholderTextColor="#9CA3AF"
                            returnKeyType="done"
                        />
                    </View>

                    {!!error && <Text style={styles.error}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.primaryBtn, (!canContinue || loading) && styles.primaryBtnDisabled]}
                        onPress={handleNext}
                        disabled={!canContinue || loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryBtnText}>NEXT</Text>
                    </TouchableOpacity>

                    <Text style={[styles.hint, !canContinue && styles.hintMuted]}>
                        {canContinue ? 'Looks good.' : 'Enter a valid weight between 35 and 250 kg.'}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    screen: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 10 },
    backBtn: { paddingVertical: 6 },
    backText: { color: '#111827', fontWeight: '700' },
    header: { marginTop: 26 },
    kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: '#6B7280' },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.6, marginTop: 10, color: '#111827' },
    subtitle: { marginTop: 8, color: '#6B7280', fontWeight: '600', lineHeight: 18, fontSize: 13 },
    form: { marginTop: 32, gap: 14 },
    inputCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 16,
        gap: 8,
    },
    inputLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3, color: '#4B5563' },
    input: {
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    primaryBtn: {
        marginTop: 8,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnDisabled: { backgroundColor: '#D1D5DB' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.6 },
    hint: { textAlign: 'center', color: '#6B7280', fontWeight: '600', fontSize: 12, marginTop: 2 },
    hintMuted: { color: '#9CA3AF' },
    error: { textAlign: 'center', color: '#EF4444', fontWeight: '700', fontSize: 12, marginTop: -6 },
});
