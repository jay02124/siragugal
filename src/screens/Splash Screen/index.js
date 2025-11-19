import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import color from '../../config/color';

const text = "SIRAGUGAL CRS FM 89.6 MHz";

export default function Splash() {
    const navigation = useNavigation();
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current; 
    const textScale = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current; 

    useEffect(() => {
        Animated.parallel([
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) {
                Animated.parallel([
                    Animated.timing(textScale, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(textOpacity, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        });

        const timer = setTimeout(() => navigation.navigate('BottomNavigation'), 4000);
        return () => clearTimeout(timer);
    }, [navigation, logoScale, logoOpacity, textScale, textOpacity]);

    return (
        // <LinearGradient colors={[color.primary, color.primary, color.primary]} style={{ flex: 1 }}>
            <View className="flex-1 items-center justify-center" style={{backgroundColor: color.white}}>
                <Animated.Image
                    source={require("../../../assets/logo/logo.png")}
                    style={{
                        height: 250,
                        width: 250,
                        transform: [
                            { scale: logoScale },
                            { translateY: logoOpacity.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                            }) },
                        ],
                        opacity: logoOpacity,
                    }}
                />
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    {text.split('').map((char, index) => {
                        const waveAnimation = textOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                        });

                        return (
                            <Animated.Text 
                                key={index}
                                style={{
                                    color: color.primary,
                                    transform: [
                                        { translateY: waveAnimation },
                                        { scale: textScale },
                                    ],
                                    opacity: textOpacity,
                                    marginHorizontal: 1,
                                }}
                                className="font-bold text-xl"
                            >
                                {char}
                            </Animated.Text>
                        );
                    })}
                </View>
            </View>
        // </LinearGradient>
    );
}
