import { Alert, Pressable, StyleSheet, TouchableOpacity, View, Text, FlatList } from 'react-native';
import React, { useState } from 'react';
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
import { fetchPosts } from '@/services/postService';
import PostCard from '@/components/PostCard';
import Loading from '@/components/Loading';
import { Animated } from "react-native";
import { useEffect } from 'react';

//-------------------------CONST------------------------------------------------------
// Định nghĩa kiểu cho props của UserHeader
interface UserHeaderProps {
  user: User | null;
  router: ReturnType<typeof useRouter>;
  handleLogout: () => void;
}
var limit = 0;

//-------------------------Function------------------------------------------------------
const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]); //hàm chứ post 
  const [hasMore, setHasMore] = useState(true);
  const [scrollY] = useState(new Animated.Value(0));
  const [translateY, setTranslateY] = useState(new Animated.Value(0));


  //cuon
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      Animated.timing(translateY, {
        toValue: value > 50 ? 100 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY]);

  const tabBarIconColor = (routeName: string) => {
    return routeName === 'Profile' ? 'blue' : 'black'; // Thay đổi màu cho trang Profile
  };


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

  //edit post 
  const onEditPost = async (item: any) => {
    router.back();
    router.push({ pathname: '/(main)/newPost', params: { ...item } })
  }
  //hàm lấy api của bài post 
  const getPosts = async () => {
    if (!hasMore) return null;
    limit = limit + 7;
    let res = await fetchPosts(limit, user.id);  // Truyền giá trị limit vào hàm fetchPosts
    if (res.success && res.data) {
      if (posts.length == res.data.length) setHasMore(false);
      setPosts(res.data);  // Chỉ gọi setPosts nếu res.data không phải là undefined
    } else {
      console.log('No posts found or fetch failed');
      setPosts([]);  // Đặt giá trị mặc định là mảng rỗng nếu không có dữ liệu
    }
  };

  // Hình ảnh user 
  const UserHeader = ({ user, router, handleLogout }: UserHeaderProps) => {
    const imageUrl = getSupabaseFileUrl(user?.image);

    return (
      <View style={styles.headerContainer}>
        {/*Header profile */}
        <Header title="Profile" showBackButton={false}>
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
      <FlatList
        data={posts}
        ListHeaderComponent={<UserHeader user={user} router={router} handleLogout={handleLogout} />}
        showsVerticalScrollIndicator={false}//ẩn thanh scroll
        contentContainerStyle={styles.listStyle}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            currentUser={user}
            router={router}
            hasShadow={true} // Pass hasShadow prop here
          />
        )}
        onEndReached={() => {
          getPosts(); // process when reaching the end to add more posts
        }}
        onEndReachedThreshold={0}
        ListFooterComponent={hasMore ? ( // loading icon
          <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
            <Loading />
          </View>
        ) : (
          <View style={{ marginVertical: 30 }}>
            <Text style={styles.noPosts}>
              No more posts
            </Text>
          </View>
        )}
      />
      {/*********************Navbar start*********************/}
      <Animated.View style={[styles.navbar, { transform: [{ translateY: translateY }] }]}>
        <Pressable onPress={() => router.push('/(main)/home')}>
          <Icon1 name="home" size={30} color={tabBarIconColor('Home')} />
        </Pressable>
        <Pressable onPress={() => router.push('/(main)/main')}>
          <Icon2 name="message-circle" size={30} color={tabBarIconColor('Message')} />
        </Pressable>
        <Pressable onPress={() => router.push('/(main)/profile')}>
          <Avatar
            uri={getSupabaseFileUrl(user?.image)}
            size={hp(4.3)}
            rounded={theme.radius.sm}
            style={{ borderWidth: 2, borderColor: tabBarIconColor('Profile') }} // Thay đổi borderColor cho avatar
          />
        </Pressable>
      </Animated.View>
      {/*********************Navbar end*********************/}
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
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(7),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
});
