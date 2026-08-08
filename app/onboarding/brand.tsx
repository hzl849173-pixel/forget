/* eslint-disable react/no-unescaped-entities */
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const splashLogo = require('@/assets/images/splash-icon.png');

export default function BrandingScreen() {
    const router = useRouter();

    const logoOpacity = useRef(new Animated.Value(1)).current;
    const logoScale = useRef(new Animated.Value(1)).current;

    const weRememberOpacity = useRef(new Animated.Value(1)).current;
    const weRememberY = useRef(new Animated.Value(0)).current;

    const soYouCanOpacity = useRef(new Animated.Value(1)).current;
    const soYouCanY = useRef(new Animated.Value(0)).current;

    const forgetOpacity = useRef(new Animated.Value(1)).current;
    const forgetScale = useRef(new Animated.Value(1)).current;
    const forgetY = useRef(new Animated.Value(0)).current;

    const fadeInOpacity = useRef(new Animated.Value(0)).current;
    const transitionOpacity = useRef(new Animated.Value(1)).current;

    const stylesMemo = useMemo(() => styles, []);

    useEffect(() => {
        // Smooth opening fade-in from beginning (0 to 1)
        fadeInOpacity.setValue(0);
        logoOpacity.setValue(1);
        logoScale.setValue(1);
        weRememberOpacity.setValue(1);
        weRememberY.setValue(0);
        soYouCanOpacity.setValue(1);
        soYouCanY.setValue(0);
        forgetOpacity.setValue(1);
        forgetScale.setValue(1);
        forgetY.setValue(0);
        transitionOpacity.setValue(1);

        Animated.timing(fadeInOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();

        // Transition to next screen (1200ms readable display delay + 250ms fade out)
        const t = setTimeout(() => {
            Animated.timing(transitionOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                router.replace('/onboarding/name');
            });
        }, 1200);

        return () => {
            clearTimeout(t);
        };
    }, [router, fadeInOpacity, logoOpacity, logoScale, weRememberOpacity, weRememberY, soYouCanOpacity, soYouCanY, forgetOpacity, forgetScale, forgetY, transitionOpacity]);

    const combinedOpacity = Animated.multiply(fadeInOpacity, transitionOpacity);

    return (
        <SafeAreaView style={stylesMemo.safe}>
            <Animated.View style={[stylesMemo.screen, { opacity: combinedOpacity }]}>
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
