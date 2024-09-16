import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { theme } from '@/constants/theme';

// Định nghĩa kiểu cho props của Header
interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  children?: React.ReactNode; // Thêm thuộc tính children
}

const Header = ({ title, showBackButton = true, children }: HeaderProps) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.childrenContainer}>
        {React.Children.map(children, child => {
          if (typeof child === 'string') {
            return <Text>{child}</Text>; // Bao bọc chuỗi văn bản trong <Text>
          }
          return child;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
    position: 'relative', // Để cho button và các phần tử con được đặt đúng vị trí
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: theme.colors.text,
  },
  button: {
    alignSelf: 'flex-start',
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  childrenContainer: {
    position: 'absolute',
    right: 10, // Đảm bảo phần tử con nằm ở góc phải
    flexDirection: 'row', // Nếu có nhiều phần tử con
    alignItems: 'center', // Căn giữa theo chiều dọc
  },
});

export default Header;
