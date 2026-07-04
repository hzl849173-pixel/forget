import { FitnessGoal, loadLocalProfile, saveLocalProfile } from '@/lib/profile/profileStorage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NameScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const p = await loadLocalProfile();
            if (!mounted) return;
            if (p?.name) setName(p.name);
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const canContinue = name.trim().length > 0;

    const handleNext = async () => {
        if (!canContinue) return;
        await saveLocalProfile({
            name: name.trim(),
            heightCm: 0,
            weightKg: 0,
            goal: '' as FitnessGoal,
        });
        router.push('/onboarding/height');
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
                    <Text style={styles.kicker}>WELCOME</Text>
                    <Text style={styles.title}>What should we call you?</Text>
                    <Text style={styles.subtitle}>Just a name so we can personalise your experience.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputCard}>
                        <Text style={styles.inputLabel}>Your name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            placeholder="e.g. Alex"
                            placeholderTextColor="#9CA3AF"
                            returnKeyType="done"
                            autoFocus
                        />
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
