import { StyleSheet, Text, View, Pressable, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal, TouchableOpacity, FlatList } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapprer";
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import Icon3 from 'react-native-vector-icons/FontAwesome';
import Icon4 from 'react-native-vector-icons/Ionicons';
import { theme } from "../constants/theme";
import { StatusBar } from 'expo-status-bar';
import { useRouter } from "expo-router";
import { wp, hp } from '../helpers/common';
import Input from "@/components/Input";
import Button from "@/components/Button";
import { supabase } from "../lib/supabase";
import RNPickerSelect from "react-native-picker-select";
import { fillKhoa } from "@/services/userService";

const SignUp = () => {
    //-------------------------------------CONST------------------------------------------------------
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(""); //chọn khoa
    const [modalVisible, setModalVisible] = useState(false); // Hiển thị modal
    //------------------------------------FUNCTION------------------------------------------------------
    const departments = [
        { label: "Khoa học máy tính", value: "Khoa học máy tính" },
        { label: "Công nghệ phần mềm", value: "Công nghệ phần mềm" },
        { label: "Kỹ thuật máy tính", value: "Kỹ thuật máy tính" },
        { label: "Hệ thống thông tin", value: "Hệ thống thông tin" },
        { label: "Mạng máy tính và truyền thông", value: "Mạng máy tính và truyền thông" },
        { label: "Khoa học và Kỹ thuật Thông tin", value: "Khoa học và Kỹ thuật Thông tin" },
    ];

    //Hàm chọn 
    const handleSelectDepartment = (department: string) => {
        setSelectedDepartment(department);
        setModalVisible(false); // Đóng modal sau khi chọn khoa
    };

    //Kiểm tra định dạng email
    const isValidEmail = (email: any) => {
        const regex = /^[A-Za-z0-9]+@gm\.uit\.edu\.vn$/; // Kiểm tra email có đúng định dạng MSSV@gm.uit.edu.vn
        return regex.test(email);
    }

    //Kiểm tra mật khẩu 
    const isValidPassword = (password: any) => {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{10,}$/; // Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và hơn 9 ký tự
        return regex.test(password);
    }

    //Xử lý nút submit 
    const onSubmit = async () => {
        //------------Nếu chưa điền đẩy đủ thông tin------------------ 
        if (!email || !password || !name || !confirmPassword) {
            Alert.alert('Đăng kí', "Bạn phải điền đầy đủ thông tin");
            return;
        }
        //--------------Kiểm tra định dạng email----------------------
        if (!isValidEmail(email)) {
            Alert.alert('Đăng kí', "Email phải có định dạng MSSV@gm.uit.edu.vn");
            return;
        }
        //----------------Kiểm tra mật khẩu----------------------------
        if (!isValidPassword(password)) {
            Alert.alert('Đăng kí', "Mật khẩu phải có ít nhất 10 ký tự, bao gồm chữ hoa, chữ thường và số");
            return;
        }
        //--------Nếu nhập 2 password không khớp nhau---------------- 
        if (password !== confirmPassword) {
            Alert.alert('Đăng kí', "Mật khẩu không khớp");
            return;
        }
        //-------------------Chọn khoa-----------------------------------
        if (!selectedDepartment) {
            Alert.alert("Đăng kí", "Bạn phải chọn khoa");
            return;
        }
        //---------------Lấy thông tin start-------------------------------
        let emailSign = email.trim();
        let nameSign = name.trim();
        let passwordSign = password.trim();
        let khoaSign = selectedDepartment.trim();
        // HỦY LOADING
        setLoading(false);

        // Đưa lên csdl
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email: emailSign,
            password: passwordSign,
            options: {
                data: {
                    name: nameSign, // Lưu tên người dùng vào metadata
                },
            },
        });
        // Xử lý lỗi trong quá trình đăng ký
        if (signUpError) {
            Alert.alert('Sign up', signUpError.message);
            return;
        }
        // Nếu đăng ký thành công, tiếp tục cập nhật thông tin người dùng
        if (user) {
            const id = user.id; // Lấy ID của người dùng từ kết quả đăng ký
            const updateResult = await fillKhoa(emailSign, khoaSign, id);

            if (updateResult.success) {
                Alert.alert('Đăng ký thành công', 'Tài khoản đã được tạo thành công');
                // Chuyển hướng đến trang khác nếu cần
            } else {
                Alert.alert('Đăng ký', `Cập nhật thông tin thất bại: ${updateResult.msg}`);
            }
        }
        //---------------Lấy thông tin end-------------------------------
    };

    //--------------------------------------MAIN------------------------------------------------------
    return (
        <ScreenWrapper bg="white">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                style={style.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/*---------- NÚT NHẤN CALL BACK-------------*/}
                    <Pressable onPress={() => router.push('/welcome')} style={style.button}>
                        <Icon name="arrow-left" size={24} color={theme.colors.text} />
                    </Pressable>

                    {/*----------------WELLCOME------------------*/}
                    <View>
                        <Text style={style.welcomeText}>Chào,</Text>
                        <Text style={style.welcomeText}>UIT SOCIAL</Text>
                    </View>

                    {/*------------------FORM--------------------*/}
                    <View style={style.form}>
                        <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
                            Vui lòng điền đầy đủ các thông tin
                        </Text>
                        {/*INPUT GMAIL*/}
                        <Input
                            icon={<Icon name="mail" size={26} />}
                            placeholder='Nhập vào email của bạn'
                            onChangeText={(value: string) => setEmail(value)}
                            value={email}
                        />
                        {/*NAME*/}
                        <Input
                            icon={<Icon2 name="user" size={26} />}
                            placeholder='Nhập vào tên của bạn'
                            onChangeText={(value: string) => setName(value)}
                            value={name}
                        />
                        {/*INPUT PASSWORD*/}
                        <Input
                            icon={<Icon1 name="password" size={26} />}
                            placeholder="Nhập vào mật khẩu của bạn"
                            onChangeText={(value: string) => setPassword(value)}
                            secureTextEntry={!showPassword}
                            value={password}
                            rightIcon={
                                <Icon3
                                    name={showPassword ? "eye-slash" : "eye"}
                                    size={20}
                                    color={theme.colors.text}
                                />
                            }
                            onRightIconPress={() => setShowPassword(!showPassword)}
                        />
                        {/*RE INPUT PASSWORD*/}
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
                        {/* INPUT CHỌN KHOA */}
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Input
                                icon={<Icon4 name="school-sharp" size={26} />}
                                placeholder="Chọn Khoa"
                                value={selectedDepartment}
                                editable={false}  // Không cho chỉnh sửa trực tiếp
                            />
                        </TouchableOpacity>
                        {/* Modal chọn khoa */}
                        <Modal
                            transparent={true}
                            visible={modalVisible}
                            animationType="slide"
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <TouchableOpacity
                                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                                onPress={() => setModalVisible(false)}  // Đóng modal khi nhấn ngoài
                            >
                                <View style={{ backgroundColor: 'white', width: '80%', borderRadius: 10 }}>
                                    <FlatList
                                        data={departments}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                onPress={() => handleSelectDepartment(item.value)} // Chọn khoa
                                                style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.text }}
                                            >
                                                <Text style={{ fontSize: hp(2), color: theme.colors.text }}>
                                                    {item.label}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Modal>
                        {/*Button*/}
                        <Button title={'Đăng kí'} loading={loading} onPress={onSubmit} />
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
    forgotPassword: {
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
    //input chọn khoa 
    input: {
        borderWidth: 1,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.xl,
        padding: 10,
        marginBottom: 15,
        fontSize: hp(2),

    }
});
