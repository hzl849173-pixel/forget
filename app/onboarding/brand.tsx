/* eslint-disable react/no-unescaped-entities */
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const splashLogo = require('@/assets/images/splash-icon.png');

export default function BrandingScreen() {
    const router = useRouter();

    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.9)).current;

    const weRememberOpacity = useRef(new Animated.Value(0)).current;
    const weRememberY = useRef(new Animated.Value(12)).current;

    const soYouCanOpacity = useRef(new Animated.Value(0)).current;
    const soYouCanY = useRef(new Animated.Value(12)).current;

    const forgetOpacity = useRef(new Animated.Value(0)).current;
    const forgetScale = useRef(new Animated.Value(0.8)).current;
    const forgetY = useRef(new Animated.Value(15)).current;

    const transitionOpacity = useRef(new Animated.Value(1)).current;

    const stylesMemo = useMemo(() => styles, []);

    useEffect(() => {
        // Reset values
        logoOpacity.setValue(0);
        logoScale.setValue(0.9);
        weRememberOpacity.setValue(0);
        weRememberY.setValue(12);
        soYouCanOpacity.setValue(0);
        soYouCanY.setValue(12);
        forgetOpacity.setValue(0);
        forgetScale.setValue(0.8);
        forgetY.setValue(15);
        transitionOpacity.setValue(1);

        // 1. Logo fades/scales in
        Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 750,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // 2. "WE REMEMBER" enters
        const t1 = setTimeout(() => {
            Animated.parallel([
                Animated.timing(weRememberOpacity, {
                    toValue: 1,
                    duration: 450,
                    useNativeDriver: true,
                }),
                Animated.timing(weRememberY, {
                    toValue: 0,
                    duration: 450,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 750);

        // 3. "SO YOU CAN" enters
        const t2 = setTimeout(() => {
            Animated.parallel([
                Animated.timing(soYouCanOpacity, {
                    toValue: 1,
                    duration: 450,
                    useNativeDriver: true,
                }),
                Animated.timing(soYouCanY, {
                    toValue: 0,
                    duration: 450,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 1250);

        // 4. "FORGET" app name enters with premium spring bounce
        const t3 = setTimeout(() => {
            Animated.parallel([
                Animated.timing(forgetOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.spring(forgetScale, {
                    toValue: 1,
                    tension: 35,
                    friction: 5.5,
                    useNativeDriver: true,
                }),
                Animated.spring(forgetY, {
                    toValue: 0,
                    tension: 35,
                    friction: 5.5,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 1850);

        // 5. Final transition fade out
        const t4 = setTimeout(() => {
            Animated.timing(transitionOpacity, {
                toValue: 0.1,
                duration: 450,
                useNativeDriver: true,
            }).start(() => {
                router.replace('/onboarding/name');
            });
        }, 3250);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [router, logoOpacity, logoScale, weRememberOpacity, weRememberY, soYouCanOpacity, soYouCanY, forgetOpacity, forgetScale, forgetY, transitionOpacity]);

    return (
        <SafeAreaView style={stylesMemo.safe}>
            <Animated.View style={[stylesMemo.screen, { opacity: transitionOpacity }]}>
                {/* Center content */}
                <View style={stylesMemo.center}>
                    <Animated.View style={[stylesMemo.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
                        <Image source={splashLogo} style={stylesMemo.logo} resizeMode="contain" />
                    </Animated.View>

                    {/* Text: cinematic, minimal layout */}
                    <View style={stylesMemo.textBlock}>
                        <View style={stylesMemo.row}>
                            <Animated.View style={[stylesMemo.phraseContainer, { opacity: weRememberOpacity, transform: [{ translateY: weRememberY }] }]}>
                                <Animated.Text style={stylesMemo.word}>WE</Animated.Text>
                                <Animated.Text style={stylesMemo.word}>REMEMBER</Animated.Text>
                            </Animated.View>

                            <Animated.View style={[stylesMemo.phraseContainer, { opacity: soYouCanOpacity, transform: [{ translateY: soYouCanY }] }]}>
                                <Animated.Text style={stylesMemo.word}>SO</Animated.Text>
                                <Animated.Text style={stylesMemo.word}>YOU</Animated.Text>
                                <Animated.Text style={stylesMemo.word}>CAN</Animated.Text>
                            </Animated.View>

                            <Animated.View style={[stylesMemo.forgetContainer, { opacity: forgetOpacity, transform: [{ translateY: forgetY }, { scale: forgetScale }] }]}>
                                <Animated.Text style={[stylesMemo.word, stylesMemo.forget]}>
                                    FORGET
                                </Animated.Text>
                            </Animated.View>
                        </View>
                    </View>
                </View>

                {/* Optional tap-to-skip for testing */}
                <Pressable onPress={() => router.replace('/onboarding/name')} style={stylesMemo.debugTap} />
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#000000' },
    screen: { flex: 1, backgroundColor: '#000000', justifyContent: 'center' },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logoWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 350,
        height: 350,
    },
    textBlock: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 16,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    phraseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10, // increased vertical gap
    },
    forgetContainer: {
        marginVertical: 10, // increased vertical gap
    },
    word: {
        color: '#E5E7EB', // softer white for general text
        fontWeight: '800',
        textTransform: 'uppercase',
        fontSize: 15,
        letterSpacing: 1.5,
        marginHorizontal: 3.5,
    },
    forget: {
        color: '#10B981',
        fontWeight: '900',
        fontSize: 24, // larger size to prioritize app name
        letterSpacing: 2.5,
        marginHorizontal: 8,
    },
    debugTap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
});
