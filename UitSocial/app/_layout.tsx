import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { supabase } from '@/lib/supabase';
import { getUserData } from '@/services/userService';

const Layout = () => {
    return (
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    );
};

const MainLayout = () => {
    const { setAuth, setUserData } = useAuth(); // Import useAuth
    const router = useRouter();

    const updateUserData = async (user:any,email:any) =>{
        let res = await getUserData(user?.id);
        if(res.success){
            setUserData({...res.data,email});
        }
    }

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
            console.log('session user: ', session?.user?.id);

            if (session?.user) {
                setAuth(session.user);
                updateUserData(session?.user,session?.user.email);
                console.log('auth user : ',session?.user?.email);
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
