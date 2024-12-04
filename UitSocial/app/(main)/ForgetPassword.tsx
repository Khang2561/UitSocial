import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";
import emailjs from "emailjs-com";
import { supabase } from "@/lib/supabase"; // Đảm bảo bạn đã cấu hình Supabase đúng
import ScreenWrapper from "@/components/ScreenWrapprer";


export default function ForgetPassword() {
  //-------------------------------------------CONST----------------------------------------------------------
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(""); // OTP được tạo

  //-----------------------------------------FUNCTION-------------------------------------------------------------

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  //----------------------------Khi gửi mail bị quên mật khẩu-----------------------------
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email.");
      return;
    }
    const otp = generateOtp(); // Tạo OTP 6 chữ số
    try {
      const response = await fetch("http://localhost:3000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Mã OTP của bạn",
          text: `Mã OTP của bạn là: ${otp}`,
        }),
      });
      if (response.ok) {
        setGeneratedOtp(otp); // Cập nhật OTP được gửi đi
        Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn.");
        setStep(2); // Chuyển sang bước nhập mã OTP
      } else {
        throw new Error("Failed to send email.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi mã OTP. Vui lòng thử lại.");
    }
  };
  

  //-----------------------------kiểm tra mã OTP đúng hay không-------------------------------- 
  const handleVerifyOtp = () => {
    if (otpCode !== generatedOtp) {
      Alert.alert("Lỗi", "Mã OTP không chính xác.");
      return;
    }
    setStep(3); // Chuyển sang bước reset mật khẩu
  };
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu không khớp.");
      return;
    }
    try {
      // Đặt lại mật khẩu
      const { error } = await supabase.auth.updateUser({
        email,
        password: newPassword,
      });
      if (error) {
        throw new Error(error.message);
      }
      Alert.alert("Thành công", "Mật khẩu đã được đặt lại.");
      setStep(1); // Quay về bước đầu tiên
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/*--------------------------Nhập vào email------------------------------ */}
        {step === 1 && (
          <>
            <Text style={styles.title}>Quên mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email của bạn"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Pressable style={styles.button} onPress={handleSendOtp}>
              <Text style={styles.buttonText}>Gửi mã xác nhận</Text>
            </Pressable>
          </>
        )}

        {/*-------------------------Nhập vào mã OTP--------------------------------- */}
        {step === 2 && (
          <>
            <Text style={styles.title}>Nhập mã xác nhận</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã OTP"
              keyboardType="numeric"
              value={otpCode}
              onChangeText={setOtpCode}
            />
            <Pressable style={styles.button} onPress={handleVerifyOtp}>
              <Text style={styles.buttonText}>Xác nhận mã</Text>
            </Pressable>
          </>
        )}

        {/*-------------------------Nhập lại mật khẩu mới---------------------------------- */}
        {step === 3 && (
          <>
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
