import { StyleSheet, View, Animated, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from 'expo-router';
import Icon1 from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Feather';
import Avatar from '@/components/Avatar';
import { getSupabaseFileUrl } from '../../services/imageService';
import { hp } from '@/helpers/common';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';
import Home from "./home";
import Profile from "./profile"; // Ensure Profile component is imported
import ScreenWrapper from "@/components/ScreenWrapprer";

const Main = () => {
    const [scrollY] = useState(new Animated.Value(0));
    const [translateY] = useState(new Animated.Value(0));
    const [activeScreen, setActiveScreen] = useState('Home');
    const router = useRouter();
    const { user } = useAuth();

    // Animation for navbar
    useEffect(() => {
        const listenerId = scrollY.addListener(({ value }) => {
            Animated.timing(translateY, {
                toValue: value > 50 ? 100 : 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });

        return () => {
            scrollY.removeListener(listenerId);
        };
    }, [scrollY]);

    const tabBarIconColor = (routeName: string) => {
        return activeScreen === routeName ? 'blue' : 'black';
    };

    const getAvatarStyle = (routeName: string) => {
        return activeScreen === routeName ? { borderColor: 'blue', borderWidth: 2 } : { borderColor: 'transparent' };
    };

    return (
        <ScreenWrapper bg="white">
            {activeScreen === 'Home' && <Home />}
            {activeScreen === 'Message' && <Profile />}
            {activeScreen === 'Profile' && <Profile />}

            {/*********************Navbar start*********************/}
            <Animated.View style={[styles.navbar, { transform: [{ translateY: translateY }] }]}>
                <Pressable onPress={() => setActiveScreen('Home')}>
                    <Icon1 name="home" size={30} color={tabBarIconColor('Home')} />
                </Pressable>
                <Pressable onPress={() => setActiveScreen('Message')}>
                    <Icon2 name="message-circle" size={30} color={tabBarIconColor('Message')} />
                </Pressable>
                <Pressable onPress={() => setActiveScreen('Profile')}>
                    <Avatar
                        uri={getSupabaseFileUrl(user?.image)}  // Ensure uri is a proper URL
                        size={hp(4.3)}
                        rounded={theme.radius.sm}
                        style={[{ borderWidth: 2 }, getAvatarStyle('Profile')]}  // Apply dynamic style
                    />
                </Pressable>
            </Animated.View>
            {/*********************Navbar end*********************/}
        </ScreenWrapper>
    );
};

export default Main;

const styles = StyleSheet.create({
    navbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: hp(7),
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        elevation: 10,
        borderTopWidth: 1,
        borderTopColor: '#eaeaea',
    },
});
