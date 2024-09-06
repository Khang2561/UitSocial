import { Alert, StyleSheet, Text, View, Button, Image, Pressable } from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapprer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '../../lib/supabase';
import { theme } from "@/constants/theme";
import { hp, wp } from '../../helpers/common';
import Icon from 'react-native-vector-icons/EvilIcons';
import Icon1 from 'react-native-vector-icons/Feather';
import { useRouter } from "expo-router";
import Avatar from "@/components/Avatar";

const Home = () => {
    const { user, setAuth } = useAuth();
    const router = useRouter();
    const defaultAvatar = 'https://topsao.vn/wp-content/uploads/2018/04/23/Link-Ka-h--t-Ng-----i---m-ph----05.jpg';
    console.log('user: ',user);
    // Đặt URI cho Avatar
    const uri = user?.image ? user.image : defaultAvatar;
    // Cập nhật thông tin người dùng nếu image là null
    useEffect(() => {
        if (user && !user.image) {
            // Cập nhật user với ảnh mặc định
            const updateUserImage = async () => {
                const { data, error } = await supabase
                    .from('users')
                    .update({ image: defaultAvatar })
                    .match({ id: user.id });

                if (error) {
                    console.error('Error updating user image:', error);
                } else {
                    console.log('User image updated successfully:', data);
                }
            };

            updateUserImage();
        }
    }, [user]);

    

    return (
        <ScreenWrapper bg='white'>
            <View style={styles.container}>
                {/*Header */}
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/images/UitLogo.jpeg')}
                        style={styles.logo}
                    />
                    <Text style={styles.title}>UitSocial</Text>
                    <View style={styles.icons}>
                        <Pressable onPress={() => router.push('/(main)/notifications')}>
                            <Icon name="heart" size={hp(3.8)} />
                        </Pressable>
                        <Pressable>
                            <Icon1 name="plus-square" size={hp(3.2)} />
                        </Pressable>
                        <Pressable onPress={() => router.push('/(main)/profile')}>
                            <Avatar
                                uri={uri}
                                size={hp(4.3)}
                                rounded={theme.radius.sm}
                                style={{ borderWidth: 2 }}
                            />
                        </Pressable>
                    </View>
                </View>
            </View>
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
