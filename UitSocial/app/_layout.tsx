import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { supabase } from '@/lib/supabase';

const Layout = () => {
    return (
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    );
};

const MainLayout = () => {
    const { setAuth } = useAuth(); // Import useAuth
    const router = useRouter();

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
            console.log('session user: ', session?.user?.id);

            if (session?.user) {
                setAuth(session.user);
                console.log('Navigating to /home');
                router.replace('/(main)/home');
            } else {
                setAuth(null);
                console.log('Navigating to /welcome');
                router.replace('/welcome');
            }
        });
    },[]);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
};

export default Layout;
