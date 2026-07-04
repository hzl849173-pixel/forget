import type { FitnessGoal, OnboardingProfile } from '@/lib/profile/profileStorage';
import { loadLocalProfile, saveLocalProfile } from '@/lib/profile/profileStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WeightUnit = 'kg' | 'lbs';

export default function WeightScreen() {
    const router = useRouter();
    const [unit, setUnit] = useState<WeightUnit>('kg');
    const [weightStr, setWeightStr] = useState('');
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [goal, setGoal] = useState<FitnessGoal>('' as FitnessGoal);
    const [heightCm, setHeightCm] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const p = await loadLocalProfile();
            if (!mounted) return;
            if (p) {
                setName(p.name);
                setGoal(p.goal);
                setHeightCm(p.heightCm);
                if (p.weightKg > 0) {
                    setWeightStr(String(Math.round(p.weightKg)));
                }
            }
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const rawValue = useMemo(() => Number(weightStr), [weightStr]);

    const weightKg = useMemo(() => {
        if (unit === 'kg') return rawValue;
        return Math.round((rawValue / 2.20462) * 10) / 10;
    }, [unit, rawValue]);

    const canContinue = unit === 'kg'
        ? Number.isFinite(rawValue) && rawValue >= 20 && rawValue <= 400
        : Number.isFinite(rawValue) && rawValue >= 44 && rawValue <= 882;

    const handleUnitToggle = (u: WeightUnit) => {
        if (u === unit) return;
        if (Number.isFinite(rawValue) && rawValue > 0) {
            if (u === 'lbs') {
                setWeightStr(String(Math.round(rawValue * 2.20462)));
            } else {
                setWeightStr(String(Math.round(rawValue / 2.20462)));
            }
        }
        setUnit(u);
    };

    const handleNext = async () => {
        setError(null);
        if (!canContinue) {
            setError(unit === 'kg' ? 'Enter a valid weight between 20 and 400 kg.' : 'Enter a valid weight between 44 and 882 lbs.');
            return;
        }
        const next: Omit<OnboardingProfile, 'updatedAt'> = {
            name,
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
                    <Text style={styles.title}>What&apos;s your weight?</Text>
                    <Text style={styles.subtitle}>Just to personalize your progress insights.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputCard}>
                        <View style={styles.unitToggle}>
                            <TouchableOpacity
                                style={[styles.unitToggleBtn, unit === 'kg' && styles.unitToggleActive]}
                                onPress={() => handleUnitToggle('kg')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.unitToggleText, unit === 'kg' && styles.unitToggleTextActive]}>kg</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.unitToggleBtn, unit === 'lbs' && styles.unitToggleActive]}
                                onPress={() => handleUnitToggle('lbs')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.unitToggleText, unit === 'lbs' && styles.unitToggleTextActive]}>lbs</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>{unit === 'kg' ? 'Kilograms' : 'Pounds'}</Text>
                        <TextInput
                            value={weightStr}
                            onChangeText={(t) => setWeightStr(t.replace(/[^\d.]/g, ''))}
                            keyboardType="numeric"
                            style={styles.input}
                            placeholder={unit === 'kg' ? 'e.g. 72' : 'e.g. 158'}
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
                </View>

                <View style={styles.footer}>
                    <View style={styles.progressDots}>
                        <View style={styles.dot} />
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                    </View>
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
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 10,
        padding: 3,
        alignSelf: 'flex-start',
    },
    unitToggleBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    unitToggleActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unitToggleText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6B7280',
    },
    unitToggleTextActive: {
        color: '#111827',
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
    error: { textAlign: 'center', color: '#EF4444', fontWeight: '700', fontSize: 12, marginTop: -6 },
    footer: {
        marginTop: 'auto',
        paddingBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressDots: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
    },
    activeDot: {
        backgroundColor: '#10B981',
        width: 24,
    },
});
