import type { FitnessGoal } from '@/lib/profile/profileStorage';
import { loadLocalProfile, saveLocalProfile } from '@/lib/profile/profileStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HeightScreen() {
    const router = useRouter();
    const [heightStr, setHeightStr] = useState('');
    const [loading, setLoading] = useState(true);
    const [goal, setGoal] = useState<FitnessGoal>('Balanced Fitness');
    const [weightKg, setWeightKg] = useState<number>(0);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const p = await loadLocalProfile();
            if (!mounted) return;
            if (p) {
                setHeightStr(String(p.heightCm));
                setGoal(p.goal);
                setWeightKg(p.weightKg);
            }
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const heightCm = useMemo(() => Number(heightStr), [heightStr]);
    const canContinue = Number.isFinite(heightCm) && heightCm >= 120 && heightCm <= 220;

    const handleNext = async () => {
        if (!canContinue) return;
        await saveLocalProfile({
            heightCm,
            weightKg: weightKg || 60,
            goal: goal,
        });
        router.push('/onboarding/weight');
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
                    <Text style={styles.kicker}>HEIGHT</Text>
                    <Text style={styles.title}>How tall are you?</Text>
                    <Text style={styles.subtitle}>Premium tracking starts here. One number. Done.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputCard}>
                        <Text style={styles.inputLabel}>Height (cm)</Text>
                        <TextInput
                            value={heightStr}
                            onChangeText={setHeightStr}
                            keyboardType="numeric"
                            style={styles.input}
                            placeholder="e.g. 172"
                            placeholderTextColor="#9CA3AF"
                            returnKeyType="done"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
                        onPress={handleNext}
                        disabled={!canContinue || loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryBtnText}>NEXT</Text>
                    </TouchableOpacity>

                    <Text style={[styles.hint, !canContinue && styles.hintMuted]}>
                        {canContinue ? 'Ready.' : 'Enter a valid height between 120 and 220 cm.'}
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
    input: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontSize: 18, fontWeight: '800', color: '#111827' },
    primaryBtn: { marginTop: 8, height: 52, borderRadius: 16, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
    primaryBtnDisabled: { backgroundColor: '#D1D5DB' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.6 },
    hint: { textAlign: 'center', color: '#6B7280', fontWeight: '600', fontSize: 12, marginTop: 2 },
    hintMuted: { color: '#9CA3AF' },
});
