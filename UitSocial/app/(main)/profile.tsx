import { Alert, Pressable, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import React from 'react';
import ScreenWrapper from '@/components/ScreenWrapprer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { hp, wp } from '@/helpers/common';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon1 from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Feather';
import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';
import { User } from '../../entity/User';
import Icon3 from 'react-native-vector-icons/Entypo';
import { getSupabaseFileUrl } from '../../services/imageService';

//-------------------------CONST------------------------------------------------------
// Định nghĩa kiểu cho props của UserHeader
interface UserHeaderProps {
  user: User | null;
  router: ReturnType<typeof useRouter>;
  handleLogout: () => void;
}

//-------------------------Function------------------------------------------------------
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

  // Hình ảnh user 
  const UserHeader = ({ user, router, handleLogout }: UserHeaderProps) => {
    const imageUrl = getSupabaseFileUrl(user?.image);

    console.log('Đường link hình ảnh:', imageUrl);
    return (
      <View style={styles.headerContainer}>
        {/*Header profile */}
        <Header title="Profile">
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon1 name="logout" color={theme.colors.rose} size={20} />
          </TouchableOpacity>
        </Header>
        {/*main*/}
        <View style={styles.container}>
          <View style={{ gap: 15 }}>
            {/*profile image*/}
            <View style={styles.avatarContainer}>
              <Avatar
                uri={getSupabaseFileUrl(user?.image)}
                size={hp(12)}
                rounded={theme.radius.xxl * 1.4}
              />
              <Pressable style={styles.editIcon} onPress={() => router.push('/(main)/editProfile')}>
                <Icon name="edit" size={20} />
              </Pressable>
            </View>

            {/*info user */}
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={styles.userName}>{user && user.name ? user.name : 'User'}</Text>
              <Text style={styles.infoText}>Khoa khoa học và kĩ thuật máy tính</Text>
            </View>

            {/*email, phone, bio */}
            <View style={{ gap: 10 }}>
              {/*email*/}
              <View style={styles.info}>
                <Icon1 name="email" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>
                  {user && user.email ? user.email : 'email@default.com'}
                </Text>
              </View>
              {/*phone*/}
              {
                user && user.phoneNumber && (
                  <View style={styles.info}>
                    <Icon2 name="phone-call" size={20} color={theme.colors.textLight} />
                    <Text style={styles.infoText}>
                      {user && user.phoneNumber ? user.phoneNumber : 'xxxxxxxxxxxxxx'}
                    </Text>
                  </View>
                )
              }
              {/*address */}
              {
                user && user.address && (
                  <View style={styles.info}>
                    <Icon3 name="location" size={20} color={theme.colors.textLight} />
                    <Text style={styles.infoText}>
                      {user && user.address ? user.address : 'xxxxxxxxxxxxxx'}
                    </Text>
                  </View>
                )
              }
              {/*bio */}
              {
                user && user.bio && (
                  <View style={styles.info}>
                    <Text style={styles.infoText}>
                      {user && user.bio ? user.bio : 'xxxxxxxxxxxxxx'}
                    </Text>
                  </View>
                )
              }
              {/*Các thông tin sau này*/}

            </View>

          </View>
        </View>
      </View>

    );
  }

  //-------------------------Main------------------------------------------------------
  return (
    <ScreenWrapper bg="white">
      <UserHeader user={user} router={router} handleLogout={handleLogout} />
    </ScreenWrapper>
  );
};



export default Profile;
//-------------------------CSS------------------------------------------------------
const styles = StyleSheet.create({
  //Header 
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
  //Image profile
  container: {},
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: '500',
    color: theme.colors.textLight,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
