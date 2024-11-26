import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapprer';
import Input from '@/components/Input';
import Header from '@/components/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Icon3 from 'react-native-vector-icons/FontAwesome';

export default function ChangePassword() {
    //-----------------------------------------------CONST---------------------------------------------------------------------------------
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, setAuth } = useAuth();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    //----------------------------------------------FUNCTION------------------------------------------------------------------------------- 
    
    // Kiểm tra mật khẩu
    const isValidPassword = (password: any) => {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{10,}$/; // Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và hơn 9 ký tự
        return regex.test(password);
    };

    // Xử lý sự kiện thay đổi mật khẩu
    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu mới không khớp. Vui lòng thử lại!');
            return;
        }
    
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
    
        if (!isValidPassword(newPassword)) {
            alert('Mật khẩu mới phải có ít nhất 10 ký tự, bao gồm chữ hoa, chữ thường và số!');
            return;
        }
    
        try {
            setLoading(true);
    
            // Thực hiện xác minh mật khẩu cũ với Supabase (nếu cần thiết)
            const { error: currentPasswordError } = await supabase.auth.signInWithPassword({
                email: user.email,  // Dùng email của người dùng hiện tại
                password: currentPassword,  // Mật khẩu cũ để xác minh
            });
    
            if (currentPasswordError) {
                alert('Mật khẩu hiện tại không đúng. Vui lòng thử lại!');
                setLoading(false);
                return;
            }
    
            // Nếu mật khẩu cũ đúng, tiến hành cập nhật mật khẩu mới
            const { error } = await supabase.auth.updateUser({
                password: newPassword,  // Mật khẩu mới
            });
    
            if (error) {
                alert('Có lỗi xảy ra khi thay đổi mật khẩu: ' + error.message);
                setLoading(false);
                return;
            }
    
            alert('Đổi mật khẩu thành công!');
            setLoading(false);
        } catch (error) {
            alert('Có lỗi xảy ra khi thay đổi mật khẩu!');
            setLoading(false);
        }
    };

    //-----------------------------------------------MAIN----------------------------------------------------------------------------------
    return (
        <ScreenWrapper>
            <Header title="Thay đổi mật khẩu" />

            <View style={styles.container}>
                {/* Nhập mật khẩu hiện tại */}
                <Text style={styles.label}>Nhập mật khẩu hiện tại</Text>
                <Input
                    icon={<Icon name="lock-outline" size={24} color={theme.colors.textLight} />}
                    placeholder="Nhập mật khẩu hiện tại"
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    rightIcon={
                        <Icon3
                            name={showCurrentPassword ? "eye-slash" : "eye"}
                            size={20}
                            color={theme.colors.text}
                            onPress={() => setShowCurrentPassword(!showCurrentPassword)} // Toggle show/hide password
                        />
                    }
                />

                {/* Nhập mật khẩu mới */}
                <Text style={styles.label}>Nhập mật khẩu mới</Text>
                <Input
                    icon={<Icon name="lock-reset" size={24} color={theme.colors.textLight} />}
                    placeholder="Nhập mật khẩu mới"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    rightIcon={
                        <Icon3
                            name={showNewPassword ? "eye-slash" : "eye"}
                            size={20}
                            color={theme.colors.text}
                            onPress={() => setShowNewPassword(!showNewPassword)} // Toggle show/hide password
                        />
                    }
                />

                {/* Nhập lại mật khẩu mới */}
                <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
                <Input
                    icon={<Icon name="lock-reset" size={24} color={theme.colors.textLight} />}
                    placeholder="Nhập lại mật khẩu mới"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    rightIcon={
                        <Icon3
                            name={showConfirmPassword ? "eye-slash" : "eye"}
                            size={20}
                            color={theme.colors.text}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle show/hide password
                        />
                    }
                />

                {/* Nút xác nhận */}
                <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Xác nhận'}</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}

//------------------------------------------------------------CSS-------------------------------------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 15, // Khoảng cách giữa các phần tử
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textDark,
        marginBottom: 5,
    },
    button: {
        marginTop: 20,
        paddingVertical: 12,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
