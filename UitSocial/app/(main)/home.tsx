import { Alert, StyleSheet, Text, View, Image, Pressable, FlatList } from "react-native";
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
import PostCard from '../../components/PostCard'
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";
import axios from 'axios';
var limit = 0;

const Home = () => {
    //-------------------------CONST------------------------------------------------------
    const { user } = useAuth(); //lấy các thông tin người dùng
    const router = useRouter(); // router để chuyển trang 
    const uri = user?.image ? getSupabaseFileUrl(user.image) : null;// lấy link ảnh cho hình đại diện 
    const [posts, setPosts] = useState<any[]>([]); //hàm chứ post 
    const [hasMore, setHasMore] = useState(true);
    const [weatherIcon, setWeatherIcon] = useState<string>(''); // Trạng thái lưu trữ biểu tượng thời tiết

    //-------------------------Function------------------------------------------------------
    useEffect(() => {
        let postChannel = supabase
            .channel('posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'post' }, handlePostEvent)
            .subscribe();

        fetchWeather();//hàm lấy thồi tiết 
        //getPosts();
        return () => {
            supabase.removeChannel(postChannel);
        }
    }, [])

    const handlePostEvent = async (payload: any) => {
        if (payload.event === 'INSERT' && payload?.new?.id) {
            let newPost = { ...payload.new };
            let res = await getUserData(newPost.userId);
            newPost.postLikes = [];
            newPost.comments = [{ count: 0 }];
            newPost.user = res.success ? res.data : {};
            setPosts(prevPosts => [newPost, ...prevPosts]);
        }
        if (payload.eventType === 'DELETE' && payload.old.id) {
            setPosts(prevPosts => {
                let updatedPosts = prevPosts.filter(post => post.id !== payload.old.id);
                return updatedPosts;
            });
            // Gọi lại hàm lấy dữ liệu sau khi xóa
            getPosts(); 
        }
    };

    //hàm lấy api của bài post 
    const getPosts = async () => {
        if (!hasMore) return null;
        limit = limit + 7;
        console.log('fetching post: ', limit);

        let res = await fetchPosts(limit,null);  // Truyền giá trị limit vào hàm fetchPosts
        if (res.success && res.data) {
            if (posts.length == res.data.length) setHasMore(false);
            setPosts(res.data);  // Chỉ gọi setPosts nếu res.data không phải là undefined
        } else {
            console.log('No posts found or fetch failed');
            setPosts([]);  // Đặt giá trị mặc định là mảng rỗng nếu không có dữ liệu
        }
    };

    // Lấy dữ liệu thời tiết
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
                    {/* Thêm biểu tượng thời tiết */}
                    <View style={styles.weatherContainer}>
                            <Pressable onPress={() => router.push('/weatherUit')}>
                            <Image 
                                source={{ uri: `https:${weatherIcon}` }} 
                                style={styles.weatherIcon} 
                            />
                            </Pressable>
                        </View>
                    <View style={styles.icons}>
                        <Pressable onPress={() => router.push('/(main)/notifications')}>
                            <Icon name="heart" size={hp(3.8)} />
                        </Pressable>
                        <Pressable onPress={() => router.push('/(main)/newPost')}>
                            <Icon1 name="plus-square" size={hp(3.2)} />
                        </Pressable>
                        <Pressable onPress={() => router.push('/(main)/profile')}>
                            <Avatar
                                uri={uri}  // Ensure uri is a proper URL
                                size={hp(4.3)}
                                rounded={theme.radius.sm}
                                style={{ borderWidth: 2 }}
                            />
                        </Pressable>
                    </View>
                </View>
                {/*********************Header end*********************/}

                {/*********************show post*********************/}
                <FlatList
                    data={posts}
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

                {/*********************show post*********************/}
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
        marginHorizontal: wp(4)
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
    avatarImage: {
        height: hp(4.3),
        width: hp(4.3),
        borderRadius: theme.radius.sm,
        borderColor: theme.colors.gray,
        borderWidth: 3,
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
        right: -10,
        top: -4,
        height: hp(2.2),
        width: hp(2.2),
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 20,
        backgroundColor: theme.colors.roseLight,
    },
    pillText: {
        color: 'white',
        fontSize: hp(1.2),
        fontWeight: '600',
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
    weatherCondition: {
        fontSize: hp(2),
        color: theme.colors.text,
    },
});
