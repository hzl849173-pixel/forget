import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ModeOption = {
    value: 'post_workout' | 'live';
    title: string;
    tag: string;
    description: string;
    dotColor: string;
};

const MODES: ModeOption[] = [
    {
        value: 'post_workout',
        title: 'Focus Mode',
        tag: 'LOG AFTER WORKOUT',
        description: 'Finish your workout first, then log all weights and reps in under 30 seconds. Zero screen time while lifting.',
        dotColor: '#2563EB',
    },
    {
        value: 'live',
        title: 'Live Session',
        tag: 'TRACK AS YOU TRAIN',
        description: 'Log sets as you go, manage active exercises, and use built-in rest timers between sets.',
        dotColor: '#10B981',
    },
];

export default function ModeScreen() {
    const router = useRouter();
    const [selectedMode, setSelectedMode] = useState<'post_workout' | 'live' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const savedMode = await AsyncStorage.getItem('@workout_logging_mode');
            if (!mounted) return;
            if (savedMode === 'live' || savedMode === 'post_workout') {
                setSelectedMode(savedMode);
            }
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const handleNext = async () => {
        if (!selectedMode) return;
        await AsyncStorage.setItem('@workout_logging_mode', selectedMode);
        await AsyncStorage.setItem('@has_seen_mode_explanation', 'true');
        router.replace('/onboarding/templates');
    };

    const handleBack = () => {
        router.replace('/onboarding/weight');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.backBtn}>
                    <Text style={styles.backText}>{'< Back'}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.kicker}>WORKOUT PREFERENCE</Text>
                    <Text style={styles.title}>Choose your flow</Text>
                    <Text style={styles.subtitle}>
                        Pick how you want Workout Journal to work with your training. You can change this anytime.
                    </Text>
                </View>

                <View style={styles.modeList}>
                    {MODES.map((m) => {
                        const isSelected = m.value === selectedMode;
                        return (
                            <TouchableOpacity
                                key={m.value}
                                activeOpacity={0.8}
                                onPress={() => setSelectedMode(m.value)}
                                style={[
                                    styles.modeCard,
                                    isSelected && {
                                        borderColor: m.dotColor,
                                        backgroundColor: `${m.dotColor}0C`,
                                        borderWidth: 1.5,
                                    },
                                ]}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardTitleRow}>
                                        <View style={[styles.dotIndicator, { backgroundColor: m.dotColor }]} />
                                        <Text style={[styles.cardTitle, isSelected && { color: m.dotColor }]}>
                                            {m.title}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.tagBadge,
                                            { backgroundColor: isSelected ? `${m.dotColor}20` : '#F3F4F6' },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.tagBadgeText,
                                                { color: isSelected ? m.dotColor : '#6B7280' },
                                            ]}
                                        >
                                            {m.tag}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.modeDescription}>{m.description}</Text>

                                {isSelected && (
                                    <View style={styles.selectedCheckRow}>
                                        <View style={[styles.selectedCheckCircle, { backgroundColor: m.dotColor }]}>
                                            <Text style={styles.selectedCheckMark}>✓</Text>
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.reassuranceBox}>
                    <Text style={styles.reassuranceText}>
                        You can switch between Focus and Live anytime right from the search bar.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.primaryBtn, (!selectedMode || loading) && styles.primaryBtnDisabled]}
                    onPress={handleNext}
                    disabled={!selectedMode || loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryBtnText}>NEXT</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <View style={styles.progressDots}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                    </View>
                </View>
            </ScrollView>
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
    backBtn: {
        paddingVertical: 6,
        alignSelf: 'flex-start',
    },
    backText: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 14,
    },
    header: {
        marginTop: 18,
        gap: 8,
    },
    kicker: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.2,
        color: '#6B7280',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.6,
        color: '#111827',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        lineHeight: 19,
    },
    modeList: {
        marginTop: 24,
        gap: 14,
    },
    modeCard: {
        position: 'relative',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        padding: 18,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dotIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.2,
    },
    tagBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    tagBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.4,
    },
    modeDescription: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4B5563',
        lineHeight: 19,
        marginTop: 2,
        paddingRight: 24,
    },
    reassuranceBox: {
        marginTop: 18,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    reassuranceText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18,
    },
    selectedCheckRow: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    selectedCheckCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedCheckMark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
    },
    primaryBtn: {
        height: 52,
        borderRadius: 14,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    primaryBtnDisabled: {
        opacity: 0.5,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
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
