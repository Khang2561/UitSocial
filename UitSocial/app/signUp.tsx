import { StyleSheet, Text, View, Pressable, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapprer";
import Icon from 'react-native-vector-icons/Feather'; 
import Icon1 from 'react-native-vector-icons/MaterialIcons'; 
import Icon2 from 'react-native-vector-icons/SimpleLineIcons'; 
import Icon3 from 'react-native-vector-icons/FontAwesome';
import { theme } from "../constants/theme";
import { StatusBar } from 'expo-status-bar'; 
import { useRouter } from "expo-router";
import { wp, hp } from '../helpers/common';
import Input from "@/components/Input";
import Button from "@/components/Button";
import { supabase } from "../lib/supabase";

const SignUp = () => {
    //-------------------------CONST------------------------------------------------------
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    //-------------------------Function------------------------------------------------------
    const onSubmit = async () => {
        if (!email || !password || !name || !confirmPassword) {
            Alert.alert('Đăng kí', "Bạn phải điền đầy đủ thông tin");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Đăng kí', "Mật khẩu không khớp");
            return;
        }

        let emailSign = email.trim();
        let nameSign = name.trim();  
        let passwordSign = password.trim();

        setLoading(true);

        const { data: { session }, error } = await supabase.auth.signUp({
            email: emailSign,
            password: passwordSign,
            options:{
                data:{
                    name
                }
            }
        });

        setLoading(false);

        console.log('session: ', session);
        console.log('error', error);

        if (error) {
            Alert.alert('Sign up', error.message);
        }
    };

    //-------------------------Main------------------------------------------------------
    return (
        <ScreenWrapper bg="white">
           <StatusBar style="dark" />
           <KeyboardAvoidingView
               style={style.container}
               behavior={Platform.OS === "ios" ? "padding" : "height"}
               keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
           >
               <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
                           Vui lòng điền đầy đủ các thông tin
                       </Text>
                       <Input
                           icon={<Icon name="mail" size={26} />}
                           placeholder='Nhập vào email của bạn'
                           onChangeText={(value: string) => setEmail(value)}
                           value={email}
                       />
                       <Input
                           icon={<Icon2 name="user" size={26} />}
                           placeholder='Nhập vào tên của bạn'
                           onChangeText={(value: string) => setName(value)}
                           value={name}
                       />
                       <Input
                           icon={<Icon1 name="password" size={26} />}
                           placeholder='Nhập vào mật khẩu của bạn'
                           onChangeText={(value: string) => setPassword(value)}
                           secureTextEntry={!showPassword}
                           value={password}
                           rightIcon={
                               <Pressable onPress={() => setShowPassword(!showPassword)}>
                                   <Icon3
                                       name={showPassword ? "eye-slash" : "eye"}
                                       size={20}
                                       color={theme.colors.text}
                                   />
                               </Pressable>
                           }
                       />
                       <Input
                           icon={<Icon1 name="password" size={26} />}
                           placeholder='Nhập lại mật khẩu của bạn'
                           onChangeText={(value: string) => setConfirmPassword(value)}
                           secureTextEntry={!showConfirmPassword}
                           value={confirmPassword}
                           rightIcon={
                               <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                   <Icon3
                                       name={showConfirmPassword ? "eye-slash" : "eye"}
                                       size={20}
                                       color={theme.colors.text}
                                   />
                               </Pressable>
                           }
                       />
                       {/*Button*/}
                       <Button title={'Đăng kí'} loading={loading} onPress={onSubmit}/>
                   </View>
                   {/*Footer*/}
                   <View style={style.footer}>
                       <Text style={style.footerText}>
                           Bạn đã có tài khoản? 
                       </Text>
                       <Pressable onPress={() => router.push('/login')}>
                           <Text style={[style.footerText, { color: theme.colors.primaryDark, fontWeight: 600 }]}>
                               Đăng nhập
                           </Text> 
                       </Pressable>
                   </View>
               </ScrollView>
           </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default SignUp;
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
    forgotPassword:{
        textAlign: 'right',
        fontWeight: 600,
        color: theme.colors.text,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    button: {
        alignSelf: 'flex-start',
        padding: 5,
        borderRadius: theme.radius.sm,
        backgroundColor: 'rgba(0,0,0,0.07)',
    },
    footerText: {
        fontSize: hp(2),
        color: theme.colors.text,
    },
});
