import AsyncStorage from '@react-native-async-storage/async-storage';
import { FitnessGoal, loadLocalProfile, saveLocalProfile } from '@/lib/profile/profileStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GoalOption = {
    value: FitnessGoal;
    title: string;
    subtitle: string;
};

const GOALS: GoalOption[] = [
    { value: 'Lean & Aesthetic', title: 'Lean & Aesthetic', subtitle: 'Look lean, feel sharp' },
    { value: 'Strong & Powerful', title: 'Strong & Powerful', subtitle: 'Build raw power & strength' },
    { value: 'Slim & Toned', title: 'Slim & Toned', subtitle: 'Shape, tone, and define' },
    { value: 'Improve Overall Health', title: 'Improve Overall Health', subtitle: 'Mobility, stamina & wellbeing' },
];

export default function NameScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const p = await loadLocalProfile();
            if (!mounted) return;
            if (p?.name) setName(p.name);
            if (p?.goal) setSelectedGoal(p.goal);
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const canContinue = name.trim().length > 0 && selectedGoal !== null;

    const handleNext = async () => {
        if (!canContinue || !selectedGoal) return;
        const p = await loadLocalProfile();
        await saveLocalProfile({
            name: name.trim(),
            heightCm: p?.heightCm || 0,
            weightKg: p?.weightKg || 0,
            goal: selectedGoal,
        });
        router.replace('/onboarding/weight');
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
                    <View style={styles.header}>
                        <Text style={styles.kicker}>GETTING STARTED</Text>
                        <Text style={styles.title}>Let&apos;s set you up</Text>
                        <Text style={styles.subtitle}>Personalize your workout journal in seconds.</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Name input */}
                        <View style={styles.inputCard}>
                            <Text style={styles.inputLabel}>WHAT SHOULD WE CALL YOU?</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                                placeholder="Your name (e.g. Alex)"
                                placeholderTextColor="#9CA3AF"
                                returnKeyType="done"
                            />
                        </View>

                        {/* Goal selector */}
                        <View style={styles.goalSection}>
                            <Text style={styles.sectionLabel}>WHAT ARE YOU TRAINING FOR?</Text>
                            <View style={styles.goalList}>
                                {GOALS.map((g) => {
                                    const isSelected = g.value === selectedGoal;
                                    return (
                                        <TouchableOpacity
                                            key={g.value}
                                            activeOpacity={0.75}
                                            onPress={() => setSelectedGoal(g.value)}
                                            style={[
                                                styles.goalCard,
                                                isSelected && styles.goalCardSelected,
                                            ]}
                                        >
                                            <View style={styles.goalCardTop}>
                                                <Text style={[styles.goalTitle, isSelected && styles.goalTitleSelected]}>
                                                    {g.title}
                                                </Text>
                                                {isSelected && <Text style={styles.goalCheck}>✓</Text>}
                                            </View>
                                            <Text style={[styles.goalSubtitle, isSelected && styles.goalSubtitleSelected]}>
                                                {g.subtitle}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
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
                            <View style={[styles.dot, styles.activeDot]} />
                            <View style={styles.dot} />
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },
    header: { marginTop: 12 },
    kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: '#6B7280' },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.6, marginTop: 8, color: '#111827' },
    subtitle: { marginTop: 6, color: '#6B7280', fontWeight: '600', lineHeight: 18, fontSize: 13 },
    form: { marginTop: 24, gap: 18 },
    inputCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 16,
        gap: 8,
    },
    inputLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#4B5563' },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    goalSection: { gap: 10 },
    sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#4B5563', marginLeft: 2 },
    goalList: { gap: 10 },
    goalCard: {
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 14,
        gap: 4,
    },
    goalCardSelected: {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
    },
    goalCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    goalTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#111827',
    },
    goalTitleSelected: {
        color: '#047857',
    },
    goalCheck: {
        fontSize: 16,
        fontWeight: '900',
        color: '#10B981',
    },
    goalSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    goalSubtitleSelected: {
        color: '#059669',
    },
    primaryBtn: {
        marginTop: 6,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnDisabled: { backgroundColor: '#D1D5DB' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.6 },
    footer: {
        marginTop: 'auto',
        paddingTop: 24,
        paddingBottom: 8,
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
