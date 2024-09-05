import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import ScreenWrapper from '@/components/ScreenWrapprer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { wp } from '@/helpers/common';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

// Định nghĩa kiểu cho User
interface User {
  id: string;
  image?: string;
  // Thêm các thuộc tính khác của user nếu cần
}

// Định nghĩa kiểu cho props của UserHeader
interface UserHeaderProps {
  user: User | null;
  router: ReturnType<typeof useRouter>;
  handleLogout: () => void;
}

const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          onPress: () => console.log('Modal cancelled'),
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              setAuth(null); // Xóa thông tin xác thực
              router.push('/login'); // Điều hướng đến màn hình đăng nhập hoặc trang khác
            } catch (error) {
              console.error('Lỗi đăng xuất:', error);
            }
          },
        },
      ],
      { cancelable: true } // Cho phép hủy bỏ modal
    );
  };

  return (
    <ScreenWrapper bg="white">
      <UserHeader user={user} router={router} handleLogout={handleLogout} />
    </ScreenWrapper>
  );
};

// Hình ảnh user 
const UserHeader = ({ user, router, handleLogout }: UserHeaderProps) => {
  return (
    <View style={styles.headerContainer}>
      <Header title="Profile" showBackButton={true}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon1 name="logout" color={theme.colors.rose} size={24} />
        </TouchableOpacity>
      </Header>
    </View>
  );
}

export default Profile;

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: wp(4),
  },
  logoutButton: {
    position: 'absolute',
    right: 10, // Điều chỉnh vị trí nếu cần
    padding: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
});
