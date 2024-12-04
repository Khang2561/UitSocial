import { Alert, StyleSheet, Text, View, Image, Pressable, FlatList, LogBox, Animated } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapprer";
import { useAuth } from "@/contexts/AuthContext";
import { theme } from "@/constants/theme";
import { hp, wp } from '../../helpers/common';
import Icon from 'react-native-vector-icons/EvilIcons';
import Icon1 from 'react-native-vector-icons/Feather';
import { useRouter } from "expo-router";
import Avatar from "@/components/Avatar";
import { getSupabaseFileUrl } from '../../services/imageService';
import { fetchPosts } from "@/services/postService";
import PostCard from '../../components/PostCard';
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";
import axios from 'axios';
LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer', 'Warning: MemoizedTNodeRenderer', 'Warning: TRenderEngineProvider']);

const Home = () => {
    //-------------------------CONST------------------------------------------------------
    const { user } = useAuth(); // Lấy các thông tin người dùng
    const router = useRouter(); // Router để chuyển trang 
    const uri = user?.image ? getSupabaseFileUrl(user.image) : null; // Lấy link ảnh cho hình đại diện 
    const [posts, setPosts] = useState<any[]>([]); // Hàm chứa post 
    const [hasMore, setHasMore] = useState(true);
    const [weatherIcon, setWeatherIcon] = useState<string>(''); // Trạng thái lưu trữ biểu tượng thời tiết
    const [notificationCount, setNotificationCount] = useState(0);//thông báo comment mới 
    const [scrollY] = useState(new Animated.Value(0));
    const [translateY] = useState(new Animated.Value(0));

    //-------------------------Function------------------------------------------------------
    useEffect(() => {
        const postChannel = supabase
            .channel('posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'post' }, handlePostEvent)
            .subscribe();
        fetchWeather(); // Hàm lấy thời tiết 
        const notificationChannel = supabase
            .channel('notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiverId=eq.${user.id}` }, handleNewNotifications)
            .subscribe();
        return () => {
            supabase.removeChannel(postChannel);
            supabase.removeChannel(notificationChannel);
        };
    }, []);

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
    }, [scrollY, translateY]);

    //THông báo nếu có comment mới vào bài viết của mình 
    const handleNewNotifications = async (payload: any) => {
        console.log('got new notifications: ', payload);
        if (payload.eventType === 'INSERT' && payload.new.id) {
            setNotificationCount(prev => prev + 1);
        }
    };

    //Khi chạm vào bài viết 
    const handlePostEvent = async (payload: any) => {
        if (payload.event === 'INSERT' && payload.new.id) {
            const newPost = { ...payload.new };
            const res = await getUserData(newPost.userId);
            newPost.postLikes = [];
            newPost.comments = [{ count: 0 }];
            newPost.user = res.success ? res.data : {};
            setPosts(prevPosts => [newPost, ...prevPosts]);
        }
        if (payload.event === 'DELETE' && payload.old.id) {
            setPosts(prevPosts => prevPosts.filter(post => post.id !== payload.old.id));
            // Gọi lại hàm lấy dữ liệu sau khi xóa
            getPosts();
        }
    };

    //Lấy các bài post 
    const getPosts = async () => {
        if (!hasMore) return;
        let limit = posts.length + 7;
        const res = await fetchPosts(limit, null);  // Truyền giá trị limit vào hàm fetchPosts
        if (res.success && res.data) {
            if (posts.length === res.data.length) setHasMore(false);
            setPosts(res.data);
        } else {
            setPosts([]);
        }
    };
    
    //api lấy thông tin thời tiết 
    const fetchWeather = async () => {
        try {
            const response = await axios.get(
                'https://api.weatherapi.com/v1/current.json',
                {
                    params: {
                        key: '552ef1c6639b4b449eb70535241409',
                        q: 'Thu Duc',
                        aqi: 'no',
                    },
                }
            );
            const weatherData = response.data;
            setWeatherIcon(weatherData.current.condition.icon); // Biểu tượng thời tiết
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    //-------------------------Main------------------------------------------------------
    return (
        <ScreenWrapper bg='white'>
            <View style={styles.container}>
                {/********************Header start*********************/}
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/images/UitLogo.jpeg')}
                        style={styles.logo}
                    />
                    <Text style={styles.title}>UitSocial</Text>
                    <View style={styles.weatherContainer}>
                        <Pressable>
                            <Image
                                source={{ uri: `https:${weatherIcon}` }}
                                style={styles.weatherIcon}
                            />
                        </Pressable>
                    </View>
                    <View style={styles.icons}>
                        <Pressable onPress={() => router.push('/(main)/notifications')}>
                            <Icon name="heart" size={hp(3.8)} />
                            {
                                notificationCount > 0 && (
                                    <View style={styles.pill}>
                                        <Text style={styles.pillText}>{notificationCount}</Text>
                                    </View>
                                )
                            }
                        </Pressable>
                        <Pressable onPress={() => router.push('/(main)/newPost')}>
                            <Icon1 name="plus-square" size={hp(3.2)} />
                        </Pressable>
                    </View>
                </View>
                {/*********************Header end*********************/}

                {/*********************Show post*********************/}
                <FlatList
                    data={posts}
                    showsVerticalScrollIndicator={false}
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
                    onEndReached={() => getPosts()} // Process when reaching the end to add more posts
                    onEndReachedThreshold={0}
                    ListFooterComponent={hasMore ? (
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
            </View>
        </ScreenWrapper>
    );
};

export default Home;

//-------------------------CSS------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: wp(4),
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(3.2),
        fontWeight: '600',
        marginLeft: 3,
    },
    logo: {
        height: 30,
        width: 40,
    },
    icons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto', // Đẩy các icon về bên phải
        gap: 18,
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
    pill: {
        position: 'absolute',
        right: -6, // Điều chỉnh vị trí từ bên phải
        top: -6,   // Điều chỉnh vị trí từ phía trên
        height: hp(2.5), // Tăng kích thước để số không bị chèn ép
        width: hp(2.5),  // Tăng kích thước để số không bị chèn ép
        justifyContent: 'center',
        alignItems: 'center', // Căn giữa số bên trong
        borderRadius: hp(2.5) / 2, // Bo tròn viên thuốc
        backgroundColor: theme.colors.roseLight,
    },
    pillText: {
        color: 'white',
        fontSize: hp(1.4), // Tăng kích thước chữ
        fontWeight: '600',
        textAlign: 'center', // Đảm bảo số được căn giữa
    },
    weatherContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weatherIcon: {
        width: 30,
        height: 30,
        marginRight: 5,
    },
});
