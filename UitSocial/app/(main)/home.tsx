import { Alert, StyleSheet, Text, View,Button } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapprer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '../../lib/supabase';

const Home = () => {
    const { setAuth } = useAuth();

    const onLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Đăng xuất', 'Lỗi đăng xuất');
        } else {
            setAuth(null); // Optional: clear the authentication context if needed
        }
    };

    return (
        <ScreenWrapper>
            <Text>
                Home
            </Text>
            {/* Add a logout button if you want */}
            <Button title="Đăng xuất" onPress={onLogout} />
        </ScreenWrapper>
    );
};

export default Home;

const styles = StyleSheet.create({});
