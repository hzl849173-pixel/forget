import { loadLocalProfile, saveLocalProfile } from '@/lib/profile/profileStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WeightUnit = 'kg' | 'lbs';
type HeightUnit = 'cm' | 'ft';

export default function WeightScreen() {
    const router = useRouter();
    const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
    const [weightStr, setWeightStr] = useState('');

    const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
    const [heightCmStr, setHeightCmStr] = useState('');
    const [heightFtStr, setHeightFtStr] = useState('');
    const [heightInStr, setHeightInStr] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const p = await loadLocalProfile();
            if (!mounted) return;
            if (p && p.weightKg > 0) {
                setWeightStr(String(Math.round(p.weightKg)));
            }
            if (p && p.heightCm > 0) {
                setHeightCmStr(String(Math.round(p.heightCm)));
                const totalInches = p.heightCm / 2.54;
                const feet = Math.floor(totalInches / 12);
                const inches = Math.round(totalInches % 12);
                setHeightFtStr(String(feet));
                setHeightInStr(String(inches));
            }
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // Weight calculations
    const rawWeightValue = useMemo(() => Number(weightStr), [weightStr]);

    const weightKg = useMemo(() => {
        if (weightUnit === 'kg') return rawWeightValue;
        return Math.round((rawWeightValue / 2.20462) * 10) / 10;
    }, [weightUnit, rawWeightValue]);

    const isWeightValid = weightUnit === 'kg'
        ? Number.isFinite(rawWeightValue) && rawWeightValue >= 20 && rawWeightValue <= 400
        : Number.isFinite(rawWeightValue) && rawWeightValue >= 44 && rawWeightValue <= 882;

    // Height calculations
    const heightCm = useMemo(() => {
        if (heightUnit === 'cm') {
            return Number(heightCmStr);
        }
        const ft = Number(heightFtStr) || 0;
        const inc = Number(heightInStr) || 0;
        return Math.round((ft * 12 + inc) * 2.54);
    }, [heightUnit, heightCmStr, heightFtStr, heightInStr]);

    const isHeightValid = heightUnit === 'cm'
        ? Number.isFinite(Number(heightCmStr)) && Number(heightCmStr) >= 90 && Number(heightCmStr) <= 250
        : Number(heightFtStr) >= 3 && Number(heightFtStr) <= 8 && Number(heightInStr) >= 0 && Number(heightInStr) < 12;

    const canContinue = isWeightValid && isHeightValid;

    const handleWeightUnitToggle = (u: WeightUnit) => {
        if (u === weightUnit) return;
        if (Number.isFinite(rawWeightValue) && rawWeightValue > 0) {
            if (u === 'lbs') {
                setWeightStr(String(Math.round(rawWeightValue * 2.20462)));
            } else {
                setWeightStr(String(Math.round(rawWeightValue / 2.20462)));
            }
        }
        setWeightUnit(u);
    };

    const handleHeightUnitToggle = (u: HeightUnit) => {
        if (u === heightUnit) return;
        if (u === 'ft') {
            const cm = Number(heightCmStr);
            if (Number.isFinite(cm) && cm > 0) {
                const totalInches = cm / 2.54;
                setHeightFtStr(String(Math.floor(totalInches / 12)));
                setHeightInStr(String(Math.round(totalInches % 12)));
            }
        } else {
            const ft = Number(heightFtStr) || 0;
            const inc = Number(heightInStr) || 0;
            if (ft > 0 || inc > 0) {
                setHeightCmStr(String(Math.round((ft * 12 + inc) * 2.54)));
            }
        }
        setHeightUnit(u);
    };

    const handleNext = async () => {
        setError(null);
        if (!isWeightValid) {
            setError(weightUnit === 'kg' ? 'Enter a valid weight between 20 and 400 kg.' : 'Enter a valid weight between 44 and 882 lbs.');
            return;
        }
        if (!isHeightValid) {
            setError(heightUnit === 'cm' ? 'Enter a valid height between 90 and 250 cm.' : 'Enter a valid height (e.g. 5 ft 10 in).');
            return;
        }
        const p = await loadLocalProfile();
        await saveLocalProfile({
            name: p?.name || '',
            heightCm,
            weightKg,
            goal: p?.goal || ('' as any),
        });
        router.replace('/onboarding/mode');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity onPress={() => router.replace('/onboarding/name')} activeOpacity={0.7} style={styles.backBtn}>
                        <Text style={styles.backText}>{'< Back'}</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.kicker}>BODY METRICS</Text>
                        <Text style={styles.title}>Height &amp; Weight</Text>
                        <Text style={styles.subtitle}>Used to calculate progress insights, BMI, and strength-to-weight stats.</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Height Card */}
                        <View style={styles.inputCard}>
                            <View style={styles.cardHeaderRow}>
                                <Text style={styles.inputLabel}>{heightUnit === 'cm' ? 'HEIGHT (CENTIMETERS)' : 'HEIGHT (FEET & INCHES)'}</Text>
                                <View style={styles.unitToggle}>
                                    <TouchableOpacity
                                        style={[styles.unitToggleBtn, heightUnit === 'cm' && styles.unitToggleActive]}
                                        onPress={() => handleHeightUnitToggle('cm')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.unitToggleText, heightUnit === 'cm' && styles.unitToggleTextActive]}>cm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.unitToggleBtn, heightUnit === 'ft' && styles.unitToggleActive]}
                                        onPress={() => handleHeightUnitToggle('ft')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.unitToggleText, heightUnit === 'ft' && styles.unitToggleTextActive]}>ft</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {heightUnit === 'cm' ? (
                                <TextInput
                                    value={heightCmStr}
                                    onChangeText={(t) => {
                                        setError(null);
                                        setHeightCmStr(t.replace(/[^\d]/g, ''));
                                    }}
                                    keyboardType="numeric"
                                    style={styles.input}
                                    placeholder="e.g. 175"
                                    placeholderTextColor="#9CA3AF"
                                    returnKeyType="next"
                                />
                            ) : (
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1, position: 'relative' }}>
                                        <TextInput
                                            value={heightFtStr}
                                            onChangeText={(t) => {
                                                setError(null);
                                                setHeightFtStr(t.replace(/[^\d]/g, ''));
                                            }}
                                            keyboardType="numeric"
                                            style={styles.input}
                                            placeholder="5"
                                            placeholderTextColor="#9CA3AF"
                                            returnKeyType="next"
                                        />
                                        <Text style={styles.unitSuffix}>ft</Text>
                                    </View>
                                    <View style={{ flex: 1, position: 'relative' }}>
                                        <TextInput
                                            value={heightInStr}
                                            onChangeText={(t) => {
                                                setError(null);
                                                setHeightInStr(t.replace(/[^\d]/g, ''));
                                            }}
                                            keyboardType="numeric"
                                            style={styles.input}
                                            placeholder="10"
                                            placeholderTextColor="#9CA3AF"
                                            returnKeyType="done"
                                        />
                                        <Text style={styles.unitSuffix}>in</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Weight Card */}
                        <View style={styles.inputCard}>
                            <View style={styles.cardHeaderRow}>
                                <Text style={styles.inputLabel}>{weightUnit === 'kg' ? 'WEIGHT (KILOGRAMS)' : 'WEIGHT (POUNDS)'}</Text>
                                <View style={styles.unitToggle}>
                                    <TouchableOpacity
                                        style={[styles.unitToggleBtn, weightUnit === 'kg' && styles.unitToggleActive]}
                                        onPress={() => handleWeightUnitToggle('kg')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.unitToggleText, weightUnit === 'kg' && styles.unitToggleTextActive]}>kg</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.unitToggleBtn, weightUnit === 'lbs' && styles.unitToggleActive]}
                                        onPress={() => handleWeightUnitToggle('lbs')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.unitToggleText, weightUnit === 'lbs' && styles.unitToggleTextActive]}>lbs</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TextInput
                                value={weightStr}
                                onChangeText={(t) => {
                                    setError(null);
                                    setWeightStr(t.replace(/[^\d.]/g, ''));
                                }}
                                keyboardType="numeric"
                                style={styles.input}
                                placeholder={weightUnit === 'kg' ? 'e.g. 75' : 'e.g. 165'}
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
                            <View style={styles.dot} />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: {
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 24,
    },
    backBtn: { paddingVertical: 6 },
    backText: { color: '#111827', fontWeight: '700' },
    header: { marginTop: 16 },
    kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: '#6B7280' },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.6, marginTop: 8, color: '#111827' },
    subtitle: { marginTop: 6, color: '#6B7280', fontWeight: '600', lineHeight: 18, fontSize: 13 },
    form: { marginTop: 24, gap: 14 },
    inputCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 16,
        gap: 12,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        shadowOpacity: 0.08,
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
    inputLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#4B5563' },
    input: {
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    unitSuffix: {
        position: 'absolute',
        right: 14,
        top: 14,
        fontSize: 14,
        fontWeight: '700',
        color: '#9CA3AF',
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
    error: { textAlign: 'center', color: '#EF4444', fontWeight: '700', fontSize: 12, marginTop: -4 },
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
