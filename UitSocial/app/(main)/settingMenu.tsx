import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import ScreenWrapper from '@/components/ScreenWrapprer';
import Header from '@/components/Header';
import Icon from 'react-native-vector-icons/AntDesign';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function SettingMenu() {

    const router = useRouter();

  const handleChangePassword = () => {
    console.log('Navigate to Change Password screen');
    router.push('/(main)/changePassword')
  };

  const handleShowInfo = () => {
    console.log('Navigate to Show Info screen');
    router.push('/(main)/managementInfo')
  };

  return (
    <ScreenWrapper>
      <Header title="Setting" />
      <View style={styles.container}>
        {/* Mục Đổi Mật Khẩu */}
        <Pressable style={styles.menuItem} onPress={handleChangePassword}>
          <View style={styles.menuContent}>
            <Icon name="lock" size={20} color={theme.colors.primary} />
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
          </View>
          <Icon name="right" size={16} />
        </Pressable>

        {/* Mục Hiển Thị Thông Tin */}
        <Pressable style={styles.menuItem} onPress={handleShowInfo}>
          <View style={styles.menuContent}>
            <Icon name="user" size={20} color={theme.colors.primary} />
            <Text style={styles.menuText}>Quản lý thông tin cá nhân</Text>
          </View>
          <Icon name="right" size={16} />
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
