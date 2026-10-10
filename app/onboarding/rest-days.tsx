import { loadLocalRestDays, saveLocalRestDays } from '@/lib/profile/profileStorage';
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

type DayOption = {
    key: string;
    short: string;
    full: string;
};

const DAYS: DayOption[] = [
    { key: 'Monday', short: 'MON', full: 'Monday' },
    { key: 'Tuesday', short: 'TUE', full: 'Tuesday' },
    { key: 'Wednesday', short: 'WED', full: 'Wednesday' },
    { key: 'Thursday', short: 'THU', full: 'Thursday' },
    { key: 'Friday', short: 'FRI', full: 'Friday' },
    { key: 'Saturday', short: 'SAT', full: 'Saturday' },
    { key: 'Sunday', short: 'SUN', full: 'Sunday' },
];

export default function RestDaysScreen() {
    const router = useRouter();
    const [selectedDays, setSelectedDays] = useState<string[]>(['Sunday']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const saved = await loadLocalRestDays();
            if (!mounted) return;
            if (saved && saved.length > 0) {
                setSelectedDays(saved);
            }
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const toggleDay = (dayKey: string) => {
        setSelectedDays((prev) => {
            if (prev.includes(dayKey)) {
                return prev.filter((d) => d !== dayKey);
            } else {
                return [...prev, dayKey];
            }
        });
    };

    const canContinue = selectedDays.length > 0;

    const handleNext = async () => {
        if (!canContinue || loading) return;
        await saveLocalRestDays(selectedDays);
        router.replace('/onboarding/mode');
    };

    const handleBack = () => {
        router.replace('/onboarding/weight');
    };

    const getSelectionSummary = () => {
        if (selectedDays.length === 0) {
            return 'Select at least 1 rest day to continue.';
        }
        const ordered = DAYS.filter((d) => selectedDays.includes(d.key)).map((d) => d.full);
        if (ordered.length === 1) {
            return `1 rest day locked: ${ordered[0]}`;
        }
        return `${ordered.length} rest days locked: ${ordered.join(', ')}`;
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
                    <Text style={styles.kicker}>RECURRING SCHEDULE</Text>
                    <Text style={styles.title}>Official Rest Days</Text>
                    <Text style={styles.subtitle}>
                        Scheduled recovery is non-negotiable. Choose the days your body repairs itself.
                    </Text>
                </View>

                {/* Sarcastic Challenge Card - Variation 3B */}
                <View style={styles.challengeCard}>
                    <View style={styles.challengeHeaderRow}>
                        <View style={styles.challengeBadge}>
                            <Text style={styles.challengeBadgeText}>THE CONSISTENCY TEST</Text>
                        </View>
                    </View>
                    <Text style={styles.challengeBody}>
                        Lock in your official rest day now. Everybody talks a big game on Day 1, but most people break their consistency before Month 1 is even over. Let’s see how far you actually go before your consistency snaps.
                    </Text>
                </View>

                {/* Day Selection */}
                <View style={styles.selectorSection}>
                    <Text style={styles.sectionLabel}>SELECT YOUR OFF-DAYS</Text>
                    <View style={styles.daysRow}>
                        {DAYS.map((day) => {
                            const isSelected = selectedDays.includes(day.key);
                            return (
                                <TouchableOpacity
                                    key={day.key}
                                    onPress={() => toggleDay(day.key)}
                                    activeOpacity={0.75}
                                    style={[
                                        styles.dayPill,
                                        isSelected && styles.dayPillSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayShortText,
                                            isSelected && styles.dayShortTextSelected,
                                        ]}
                                    >
                                        {day.short}
                                    </Text>
                                    <View
                                        style={[
                                            styles.dayIndicator,
                                            isSelected && styles.dayIndicatorSelected,
                                        ]}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text
                        style={[
                            styles.summaryText,
                            selectedDays.length === 0 && styles.summaryTextWarning,
                        ]}
                    >
                        {getSelectionSummary()}
                    </Text>
                </View>

                <View style={styles.reassuranceBox}>
                    <Text style={styles.reassuranceText}>
                        You can adjust your training schedule and rest days anytime in settings.
                    </Text>
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    style={[
                        styles.primaryBtn,
                        (!canContinue || loading) && styles.primaryBtnDisabled,
                    ]}
                    onPress={handleNext}
                    disabled={!canContinue || loading}
                    activeOpacity={0.85}
                >
                    <Text style={styles.primaryBtnText}>I WON&apos;T BREAK</Text>
                </TouchableOpacity>

                {/* Footer Progress Dots */}
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
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
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
    challengeCard: {
        marginTop: 22,
        borderRadius: 18,
        backgroundColor: '#0F172A',
        padding: 20,
        gap: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    challengeHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    challengeBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    challengeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.8,
        color: '#F87171',
    },
    challengeBody: {
        fontSize: 14,
        fontWeight: '500',
        color: '#F1F5F9',
        lineHeight: 22,
        letterSpacing: -0.1,
    },
    selectorSection: {
        marginTop: 26,
        gap: 12,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.6,
        color: '#4B5563',
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },
    dayPill: {
        flex: 1,
        minHeight: 64,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    dayPillSelected: {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
    },
    dayShortText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#4B5563',
    },
    dayShortTextSelected: {
        color: '#065F46',
    },
    dayIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D1D5DB',
    },
    dayIndicatorSelected: {
        backgroundColor: '#10B981',
        width: 14,
        borderRadius: 3,
    },
    summaryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 4,
    },
    summaryTextWarning: {
        color: '#EF4444',
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
    primaryBtn: {
        height: 52,
        borderRadius: 14,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 26,
    },
    primaryBtnDisabled: {
        opacity: 0.45,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 28,
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
