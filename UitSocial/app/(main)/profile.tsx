import { Alert, Pressable, StyleSheet, TouchableOpacity, View, Text, FlatList, Modal, TextInput } from 'react-native';
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
import Icon4 from 'react-native-vector-icons/Fontisto';
import ListFriend from '@/components/ListFriend';
import { getUserFriendsList } from '@/services/userService'
//----------------------------------------------------------------CONST------------------------------------------------------
// Định nghĩa kiểu cho props của UserHeader
interface UserHeaderProps {
  user: User | null;
  router: ReturnType<typeof useRouter>;
  handleLogout: () => void;
}
var limit = 0;

const Profile = () => {
  //-------------------------------------------------------------CONST--------------------------------------------------------
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]); //hàm chứ post 
  const [hasMore, setHasMore] = useState(true);
  const [scrollY] = useState(new Animated.Value(0));
  const [translateY, setTranslateY] = useState(new Animated.Value(0));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);

  //-------------------------------------------------------------FUNCTION------------------------------------------------------
  //------------------Cuộn trang--------------------- 
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

  //----------lấy danh sách bạn bè------------------------- 
  useEffect(() => {
    const loadFriends = async () => {
      if (user?.id) {
        const result = await getUserFriendsList(user.id);
        if (result.success && result.data) {
          setFriends(result.data);
        } else {
          console.error(result.msg || 'Không thể lấy danh sách bạn bè');
        }
      }
    };
    loadFriends();
  }, [user]);

  //-------------------Hàm đăng xuất---------------------- 
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

  //-------------------Setting page----------------------
  const settingPage = async () =>{
    router.push('/(main)/settingMenu')
  }

  //------------hàm lấy api của bài post---------------------- 
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

  //----------------Thông tin của user----------------------- 
  const UserHeader = ({ user, router, handleLogout }: UserHeaderProps) => {
    const imageUrl = getSupabaseFileUrl(user?.image);
    return (
      <View style={styles.headerContainer}>
        {/*Header profile */}
        <Header title="Profile" showBackButton={false}>
          {/*Setting */}
          <TouchableOpacity style={styles.settingButton} onPress={settingPage}>
            <Icon name="setting" color={theme.colors.dark} size={20} />
          </TouchableOpacity>
          {/*Logout*/}
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
              <Text style={styles.infoText}>{user && user.Khoa ? user.Khoa : 'Chưa xác định khoa'}</Text>
            </View>
            {/*email, phone, bio */}
            <View style={{ gap: 10 }}>
              {/*email*/}
              <View style={styles.info}>
                <Icon4 name='email' size={20} color={theme.colors.textLight} />
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
              {/*--------------------Danh sách bạn bè--------------------------------*/}
              <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                <View style={styles.friendListHeader}>
                  <Text style={styles.friendListTitle}>Danh sách bạn bè</Text>
                  <Text>Xem thêm</Text>
                </View>

                <View style={styles.friendTableShow}>
                  {friends.slice(0, 3).map((friend, index) => (
                    <View key={friend.id} style={styles.friendContainer}>
                      <Avatar
                        uri={friend.avatar_url ? getSupabaseFileUrl(friend.avatar_url) : "https://via.placeholder.com/150"} // Đường dẫn ảnh từ Supabase
                        size={hp(11)}
                        rounded={theme.radius.xxl * 1.2}
                      />
                      <Text style={styles.friendTableShowText}>{friend.name || 'User'}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/*Modal hiển thị thông tin danh sách bạn bè*/}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <ListFriend friend={friends} />
        </Modal>
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
    right:-30, // Điều chỉnh vị trí nếu cần
    padding: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },

  settingButton: {
    marginRight: 30,
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
  //------------------------------------------------------------
  friendListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Căn đều giữa tiêu đề và nút "Xem thêm"
    alignItems: 'center',
    marginBottom: 10, // Khoảng cách phía dưới tiêu đề
  },
  friendListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'blue', // Màu xanh lá cho chữ "Xem thêm"
    textAlign: 'right', // Căn phải
  },
  friendTableShow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Giãn đều các phần tử
    alignItems: 'center',
    marginVertical: 10, // Thêm khoảng cách giữa các dòng bạn bè
    paddingHorizontal: 10, // Thêm padding cho hai bên
  },
  friendContainer: {
    alignItems: 'center', // Căn giữa các avatar và tên bạn bè
    justifyContent: 'center',
    width: wp(25), // Giới hạn độ rộng của mỗi khung bạn bè
  },
  friendTableShowText: {
    fontSize: hp(1.8),
    fontWeight: '500',
    color: theme.colors.textDark,
    textAlign: 'center', // Căn giữa tên bạn bè
    marginTop: 8, // Khoảng cách giữa avatar và tên
  },
  //---------------------------------------------------
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
