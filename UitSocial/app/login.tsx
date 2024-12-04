import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapprer";
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Icon3 from 'react-native-vector-icons/FontAwesome';
import { theme } from "../constants/theme";
import { StatusBar } from 'expo-status-bar';
import { useRouter } from "expo-router";
import { wp, hp } from '../helpers/common';
import Input from "@/components/Input";
import Button from "@/components/Button";
import { supabase } from '../lib/supabase'

const Login = () => {
    //-------------------------CONST------------------------------------------------------
    const router = useRouter();
    const [email, setEmail] = useState(''); // Khai báo state cho email
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    //-------------------------Function------------------------------------------------------
    //SỰ KIỆN NÚT BẤM 
    const onSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Login', "Bạn phải điền đầy đủ thông tin");
            return;
        }
        let emailLog = email.trim();
        let passwordLog = password.trim();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        setLoading(false);
        console.log('error:', error);
        if (error) {
            Alert.alert('Login', error.message);
        }
    }

    //-------------------------Main------------------------------------------------------
    return (
        <ScreenWrapper bg="white">
            <StatusBar style="dark" />
            <View style={style.container}>
                {/* NÚT NHẤN CALL BACK */}
                <Pressable onPress={() => router.push('/welcome')} style={style.button}>
                    <Icon name="arrow-left" size={24} color={theme.colors.text} />
                </Pressable>

                {/* Welcome */}
                <View>
                    <Text style={style.welcomeText}>Chào,</Text>
                    <Text style={style.welcomeText}>UIT SOCIAL</Text>
                </View>

                {/* FORM */}
                <View style={style.form}>
                    <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
                        Đăng nhập để tiếp tục
                    </Text>
                    <Input
                        icon={<Icon name="mail" size={26} />}
                        placeholder='Nhập vào email của bạn'
                        onChangeText={(value: string) => setEmail(value)} // Chỉ định kiểu cho value
                        value={email} // Đặt giá trị cho TextInput
                    />
                    <Input
                        icon={<Icon1 name="password" size={26} />}
                        placeholder='Nhập vào mật khẩu của bạn'
                        onChangeText={(value: string) => setPassword(value)} // Chỉ định kiểu cho value
                        secureTextEntry={!showPassword}
                        value={password} // Đặt giá trị cho TextInput
                        rightIcon={
                            <Icon3
                                name={showPassword ? "eye-slash" : "eye"}
                                size={20}
                                color={theme.colors.text}
                            />
                        }
                        onRightIconPress={() => setShowPassword(!showPassword)}
                    />
                    <Text
                        style={style.forgotPassword}
                        onPress={() => {
                            router.push('/(main)/ForgetPassword');
                        }}>
                        Bạn quên mật khẩu ?
                    </Text>
                    <Button title={'Đăng nhập'} loading={loading} onPress={onSubmit} />
                </View>
                {/*Footer*/}
                <View style={style.footer}>
                    <Text style={style.footerText}>
                        Không có tài khoảng
                    </Text>
                    <Pressable onPress={() => router.push('/signUp')}>
                        <Text style={[style.footerText, { color: theme.colors.primaryDark, fontWeight: 600 }]}>
                            Đăng kí
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    );
}
export default Login;
//-------------------------CSS------------------------------------------------------
const style = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
    },
    welcomeText: {
        fontSize: hp(4),
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    form: {
        gap: 25,
    },
    forgotPassword: {
        textAlign: 'right',
        fontWeight: '600',
        color: theme.colors.text
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    button: {
        alignSelf: 'flex-start',
        padding: 5,
        borderRadius: theme.radius.sm,
        backgroundColor: 'rgba(0,0,0,0.07)',
    },
    footerText: {
        fontSize: hp(2), // Kích thước chữ footer
        color: theme.colors.text, // Màu chữ footer
    },
});
