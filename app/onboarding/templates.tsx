import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnboardingCompleted } from '@/lib/profile/profileStorage';
import { DEFAULT_TEMPLATES } from '@/hooks/use-workout-storage';
import { DEFAULT_EXERCISES, MUSCLE_GROUPS, MuscleGroup } from '@/constants/exercises';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

const categoryColors: Record<string, string> = {
    Chest: '#10B981',
    Triceps: '#06B6D4',
    Biceps: '#3B82F6',
    Back: '#A855F7',
    Legs: '#FF8A00',
    'Abs & Shoulders': '#22C55E',
    Abs: '#22C55E',
    Shoulders: '#22C55E',
};

export default function TemplatesScreen() {
    const router = useRouter();

    const getExerciseDetails = (id: string) => {
        return DEFAULT_EXERCISES.find((e) => e.id === id);
    };

    const sortTemplateExercises = (exercisesList: typeof DEFAULT_TEMPLATES[0]['exercises']) => {
        return [...exercisesList].sort((a, b) => {
            const detailsA = getExerciseDetails(a.exerciseId);
            const detailsB = getExerciseDetails(b.exerciseId);
            const muscleA = detailsA ? detailsA.muscleGroup : '';
            const muscleB = detailsB ? detailsB.muscleGroup : '';
            const idxA = MUSCLE_GROUPS.indexOf(muscleA as MuscleGroup);
            const idxB = MUSCLE_GROUPS.indexOf(muscleB as MuscleGroup);
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
    };

    const handleSelectTemplate = async (tmpl: typeof DEFAULT_TEMPLATES[0]) => {
        const sorted = sortTemplateExercises(tmpl.exercises);
        const exercisesToLoad = sorted.map((logEx) => ({
            id: generateId(),
            exerciseId: logEx.exerciseId,
            sets: logEx.sets.map((s) => ({
                id: generateId(),
                weight: s.weight || 0,
                reps: s.reps || 0,
                isCompleted: false,
            })),
            notes: logEx.notes || '',
        }));

        const now = Date.now();
        await AsyncStorage.setItem('@active_session_exercises', JSON.stringify(exercisesToLoad));
        await AsyncStorage.setItem('@session_start_time', String(now));
        await AsyncStorage.setItem('@session_started_from_template', 'true');
        await AsyncStorage.setItem('@session_template_id', tmpl.id);

        await setOnboardingCompleted();
        router.replace('/');
    };

    const handleSkip = async () => {
        await setOnboardingCompleted();
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.screen}>
                <TouchableOpacity onPress={() => router.replace('/onboarding/signin')} activeOpacity={0.7} style={styles.backBtn}>
                    <Text style={styles.backText}>{'< Back'}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.kicker}>QUICK START</Text>
                    <Text style={styles.title}>Pick a starter template</Text>
                    <Text style={styles.subtitle}>
                        Choose from 5 starter routines below, or skip to start with a blank journal.
                    </Text>
                </View>

                <ScrollView 
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                >
                    {DEFAULT_TEMPLATES.map((tmpl) => {
                        // Gather unique muscles involved in this template
                        const muscles = tmpl.exercises
                            .map((ex) => getExerciseDetails(ex.exerciseId)?.muscleGroup)
                            .filter((m): m is MuscleGroup => !!m);
                        const uniqueMuscles = [...new Set(muscles)];
                        const exerciseNames = tmpl.exercises
                            .map((ex) => getExerciseDetails(ex.exerciseId)?.name)
                            .filter(Boolean)
                            .join(' • ');

                        const firstEx = tmpl.exercises[0];
                        const firstExDetails = firstEx ? getExerciseDetails(firstEx.exerciseId) : null;
                        const primaryMuscle = firstExDetails ? firstExDetails.muscleGroup : 'Chest';
                        const muscleColor = categoryColors[primaryMuscle] || '#10B981';

                        return (
                            <TouchableOpacity
                                key={tmpl.id}
                                activeOpacity={0.8}
                                onPress={() => handleSelectTemplate(tmpl)}
                                style={[
                                    styles.templateCard,
                                    { borderLeftWidth: 4, borderLeftColor: muscleColor }
                                ]}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{tmpl.name}</Text>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {tmpl.exercises.length} Exercises
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.exercisesPreview} numberOfLines={2}>
                                    {exerciseNames}
                                </Text>

                                <View style={styles.muscleRow}>
                                    {uniqueMuscles.map((muscle) => (
                                        <View key={muscle} style={styles.muscleTag}>
                                            <Text style={styles.muscleTagText}>{muscle}</Text>
                                        </View>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.skipBtn}
                        onPress={handleSkip}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.skipText}>Skip template selection</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <View style={styles.progressDots}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
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
    header: { marginTop: 14 },
    kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: '#6B7280' },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.6, marginTop: 8, color: '#111827' },
    subtitle: { marginTop: 6, color: '#6B7280', fontWeight: '600', lineHeight: 18, fontSize: 13 },
    scroll: { flex: 1, marginTop: 14 },
    scrollContent: { gap: 10, paddingBottom: 16 },
    templateCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        paddingVertical: 13,
        paddingHorizontal: 15,
        gap: 6,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '900', color: '#111827' },
    badge: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    badgeText: { fontSize: 11, fontWeight: '800', color: '#047857' },
    exercisesPreview: { fontSize: 12, fontWeight: '600', color: '#6B7280', lineHeight: 16 },
    muscleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
    muscleTag: {
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    muscleTagText: { fontSize: 10, fontWeight: '700', color: '#4B5563' },
    actions: { paddingVertical: 10 },
    skipBtn: {
        height: 50,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipText: { color: '#6B7280', fontWeight: '800', letterSpacing: 0.3, fontSize: 14 },
    footer: {
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
