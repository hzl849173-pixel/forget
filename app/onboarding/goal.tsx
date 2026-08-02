import type { FitnessGoal, OnboardingProfile } from '@/lib/profile/profileStorage';
import { loadLocalProfile, saveLocalProfile } from '@/lib/profile/profileStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GoalOption = {
    value: FitnessGoal;
    title: string;
    subtitle: string;
};

const GOALS: GoalOption[] = [
    { value: 'Lean & Aesthetic', title: 'Lean & Aesthetic', subtitle: 'Look lean, feel sharp' },
    { value: 'Strong & Powerful', title: 'Strong & Powerful', subtitle: 'Build power and confidence' },
    { value: 'Slim & Toned', title: 'Slim & Toned', subtitle: 'Shape and define with consistency' },
    { value: 'Improve Overall Health', title: 'Improve Overall Health', subtitle: 'Support mobility, endurance, and wellbeing' },
];

export default function GoalScreen() {
    const router = useRouter();

    const [selected, setSelected] = useState<FitnessGoal | null>(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [heightCm, setHeightCm] = useState<number>(0);
    const [weightKg, setWeightKg] = useState<number>(0);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const p = await loadLocalProfile();
            if (!mounted) return;

            if (p) {
                setName(p.name);
                setSelected(p.goal);
                setHeightCm(p.heightCm);
                setWeightKg(p.weightKg);
            }
            setLoading(false);
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const canContinue = selected !== null;

    const onNext = async () => {
        if (!canContinue || !selected) return;
        const next: Omit<OnboardingProfile, 'updatedAt'> = {
            name,
            heightCm,
            weightKg,
            goal: selected,
        };
        await saveLocalProfile(next);
        router.push('/onboarding/templates');
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
                    <Text style={styles.kicker}>FITNESS GOAL</Text>
                    <Text style={styles.title}>What are you training for?</Text>
                    <Text style={styles.subtitle}>Pick the goal that matches your “why”.</Text>
                </View>

                <View style={styles.list}>
                    {GOALS.map((g) => {
                        const isSelected = g.value === selected;
                        return (
                            <TouchableOpacity
                                key={g.value}
                                activeOpacity={0.8}
                                onPress={() => setSelected(g.value)}
                                style={[
                                    styles.optionCard,
                                    isSelected && { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
                                ]}
                            >
                                <View style={styles.optionTop}>
                                    <Text style={[styles.optionTitle, isSelected && { color: '#047857' }]}>{g.title}</Text>
                                    {isSelected && <Text style={styles.check}>✓</Text>}
                                </View>
                                <Text style={[styles.optionSubtitle, isSelected && { color: '#059669' }]}>{g.subtitle}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.primaryBtn, (!canContinue || loading) && styles.primaryBtnDisabled]}
                    onPress={onNext}
                    disabled={!canContinue || loading}
                    activeOpacity={0.85}
                >
                    <Text style={styles.primaryBtnText}>NEXT</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <View style={styles.progressDots}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={[styles.dot, styles.activeDot]} />
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
    list: { marginTop: 22, gap: 12, flex: 1 },
    optionCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 16,
        gap: 6,
    },
    optionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    optionTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
    optionSubtitle: { fontSize: 12, fontWeight: '600', color: '#6B7280', lineHeight: 16 },
    check: { fontSize: 16, fontWeight: '900', color: '#10B981' },
    primaryBtn: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
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
