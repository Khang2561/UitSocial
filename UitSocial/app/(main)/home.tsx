import { Alert, StyleSheet, Text, View, Button, Image, Pressable } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapprer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '../../lib/supabase';
import { theme } from "@/constants/theme";
import { hp, wp } from '../../helpers/common';
import Icon from 'react-native-vector-icons/EvilIcons';
import Icon1 from 'react-native-vector-icons/Feather';

const Home = () => {
    const { user, setAuth } = useAuth();

    console.log('user : ', user);

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
            <View style={styles.container}>
                {/*Header */}
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/images/UitLogo.jpeg')}  
                        style={styles.logo}
                    />
                    <Text style={styles.title}>UitSocial</Text>
                    <View style={styles.icons}>
                        <Pressable>
                            <Icon name="heart" size={hp(3.8)} />
                        </Pressable>
                        <Pressable>
                            <Icon1 name="plus-square" size={hp(3.2)} />
                        </Pressable>
                        <Pressable>
                            <Icon name="user" size={hp(3.8)} />
                        </Pressable>
                    </View>
                </View>
            </View>
            <Button title="Đăng xuất" onPress={onLogout} />
        </ScreenWrapper>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: wp(4)
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(3.2),
        fontWeight: '600',
        marginLeft: 3,
    },
    logo: {
        height: 30,
        width: 40,
    },
    icons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto', // Đẩy các icon về bên phải
        gap: 18,
    },
    avatarImage: {
        height: hp(4.3),
        width: hp(4.3),
        borderRadius: theme.radius.sm,
        borderColor: theme.colors.gray,
        borderWidth: 3,
    },
    listStyle: {
        paddingTop: 20,
        paddingHorizontal: wp(4),
    },
    noPosts: {
        fontSize: hp(2),
        textAlign: 'center',
        color: theme.colors.text,
    },
    pill: {
        position: 'absolute',
        right: -10,
        top: -4,
        height: hp(2.2),
        width: hp(2.2),
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 20,
        backgroundColor: theme.colors.roseLight,
    },
    pillText: {
        color: 'white',
        fontSize: hp(1.2),
        fontWeight: '600',
    },
});
