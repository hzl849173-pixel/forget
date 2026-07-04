import type { FitnessGoal } from '@/lib/profile/profileStorage';
import { loadLocalProfile, saveLocalProfile } from '@/lib/profile/profileStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HeightUnit = 'cm' | 'ft';

export default function HeightScreen() {
    const router = useRouter();
    const [unit, setUnit] = useState<HeightUnit>('cm');
    const [heightStr, setHeightStr] = useState('');
    const [feetStr, setFeetStr] = useState('');
    const [inchesStr, setInchesStr] = useState('');
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [goal, setGoal] = useState<FitnessGoal>('' as FitnessGoal);
    const [weightKg, setWeightKg] = useState<number>(0);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const p = await loadLocalProfile();
            if (!mounted) return;
            if (p) {
                setName(p.name);
                if (p.heightCm > 0) {
                    setHeightStr(String(p.heightCm));
                    const totalInches = p.heightCm / 2.54;
                    const ft = Math.floor(totalInches / 12);
                    const inc = Math.round(totalInches % 12);
                    setFeetStr(String(ft));
                    setInchesStr(String(inc));
                }
                setGoal(p.goal);
                setWeightKg(p.weightKg);
            }
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const heightCm = useMemo(() => {
        if (unit === 'cm') return Number(heightStr);
        const ft = Number(feetStr);
        const inc = Number(inchesStr);
        if (!Number.isFinite(ft) || !Number.isFinite(inc)) return NaN;
        return Math.round((ft * 30.48 + inc * 2.54) * 10) / 10;
    }, [unit, heightStr, feetStr, inchesStr]);

    const canContinue = Number.isFinite(heightCm) && heightCm >= 50 && heightCm <= 280;

    const handleUnitToggle = (u: HeightUnit) => {
        if (u === unit) return;
        if (Number.isFinite(heightCm) && heightCm > 0) {
            if (u === 'ft') {
                const totalInches = heightCm / 2.54;
                setFeetStr(String(Math.floor(totalInches / 12)));
                setInchesStr(String(Math.round(totalInches % 12)));
            } else {
                setHeightStr(String(Math.round(heightCm)));
            }
        }
        setUnit(u);
    };

    const handleNext = async () => {
        if (!canContinue) return;
        await saveLocalProfile({
            name,
            heightCm,
            weightKg,
            goal,
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
                        <View style={styles.unitToggle}>
                            <TouchableOpacity
                                style={[styles.unitToggleBtn, unit === 'cm' && styles.unitToggleActive]}
                                onPress={() => handleUnitToggle('cm')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.unitToggleText, unit === 'cm' && styles.unitToggleTextActive]}>cm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.unitToggleBtn, unit === 'ft' && styles.unitToggleActive]}
                                onPress={() => handleUnitToggle('ft')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.unitToggleText, unit === 'ft' && styles.unitToggleTextActive]}>ft</Text>
                            </TouchableOpacity>
                        </View>

                        {unit === 'cm' ? (
                            <>
                                <Text style={styles.inputLabel}>Centimetres</Text>
                                <TextInput
                                    value={heightStr}
                                    onChangeText={setHeightStr}
                                    keyboardType="numeric"
                                    style={styles.input}
                                    placeholder="e.g. 172"
                                    placeholderTextColor="#9CA3AF"
                                    returnKeyType="done"
                                />
                            </>
                        ) : (
                            <View style={styles.dualInputRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Feet</Text>
                                    <TextInput
                                        value={feetStr}
                                        onChangeText={setFeetStr}
                                        keyboardType="numeric"
                                        style={styles.input}
                                        placeholder="5"
                                        placeholderTextColor="#9CA3AF"
                                        returnKeyType="done"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Inches</Text>
                                    <TextInput
                                        value={inchesStr}
                                        onChangeText={setInchesStr}
                                        keyboardType="numeric"
                                        style={styles.input}
                                        placeholder="9"
                                        placeholderTextColor="#9CA3AF"
                                        returnKeyType="done"
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
                        onPress={handleNext}
                        disabled={!canContinue || loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryBtnText}>NEXT</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <View style={styles.progressDots}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
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
    input: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontSize: 18, fontWeight: '800', color: '#111827' },
    dualInputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    primaryBtn: { marginTop: 8, height: 52, borderRadius: 16, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
    primaryBtnDisabled: { backgroundColor: '#D1D5DB' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.6 },
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
