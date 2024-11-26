import React, { useEffect, useState } from "react";
import {
    StyleSheet, Text, View, Pressable, TextInput, FlatList, ScrollView,
} from "react-native";
import ScreenWrapper from "./ScreenWrapprer";
import Header from "./Header";
import Loading from "./Loading";
import Avatar from "./Avatar";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import { getSupabaseFileUrl } from '../services/imageService';
import { fetchPosts } from "@/services/postService";
import { Modal } from "react-native";
import PostCard from "./PostCard";
import { useRouter } from 'expo-router';
import { useAuth } from "@/contexts/AuthContext";
import { getUserFriendsList, rejectFriendRequest } from "@/services/userService";



interface Friend {
    id: string;
    name: string;
    avatar_url: string;
    status: number;
}

interface Props {
    friend: Friend[];
}

const ListFriend: React.FC<Props> = ({ friend }) => {
    //-------------------------CONST------------------------------------------------------
    const [searchText, setSearchText] = useState("");
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>(friend);
    const [loading, setLoading] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [posts, setPosts] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [postLimit, setPostLimit] = useState(15);
    const router = useRouter();

    const { user, setAuth } = useAuth();

    //-------------------------Function------------------------------------------------------

    // Search function
    const handleSearch = (text: string) => {
        setSearchText(text);
        if (text.trim()) {
            const filteredData = friend.filter((user) =>
                user.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredFriends(filteredData);
        } else {
            setFilteredFriends(friend);
        }
    };

    // Select a friend
    const handleSelectFriend = (friendData: Friend) => {
        setSelectedFriend(friendData);
        setPosts([]);
        setHasMore(true);
        setPostLimit(15); // Reset limit when a new friend is selected
        getPosts(friendData.id); // Fetch posts for the new friend
        setIsModalVisible(true);
        console.log("ban da nhan vao *")
    };

    //function lấy bài post của bạn bè 
    const getPosts = async (id: String) => {
        if (!hasMore) return;
        const res = await fetchPosts(postLimit, id);
        if (res.success && res.data) {
            if (res.data.length < postLimit) setHasMore(false); // Check if more posts are available
            setPosts(prevPosts => [...prevPosts, ...res.data]);
        } else {
            setPosts([]);
            setHasMore(false);
        }
    };

    // Hàm lấy lại danh sách bạn bè mới
const fetchUpdatedFriendsList = async () => {
    const response = await getUserFriendsList(user.id);
    return response.data; // Giả sử API trả về danh sách bạn bè
};

//Function to handle unfriend
const handleUnfriend = async (friendId: string) => {
    try {
        // Gọi API hủy kết bạn
        await rejectFriendRequest(user.id, friendId);
        console.log("Hủy kết bạn thành công");

        // Cập nhật lại danh sách bạn bè sau khi hủy kết bạn
        const updatedFriends = await fetchUpdatedFriendsList(); // Lấy lại danh sách bạn bè mới
        
        // Kiểm tra nếu updatedFriends không phải là undefined
        if (updatedFriends) {
            setFilteredFriends(updatedFriends);  // Cập nhật danh sách bạn bè
        } else {
            console.log("Danh sách bạn bè không có sẵn");
        }
    } catch (error) {
        console.log("Đã có lỗi xảy ra khi hủy kết bạn:", error);
    }
};

    // Render a single friend item
    const renderItem = ({ item }: { item: Friend }) => (
        <Pressable onPress={() => handleSelectFriend(item)}>
            <View style={styles.friendItem}>
                <Avatar
                    uri={item.avatar_url ? getSupabaseFileUrl(item.avatar_url) : "https://via.placeholder.com/150"}
                    size={hp(6)}
                    rounded={theme.radius.sm}
                />
                <Text style={styles.userName}>{item.name}</Text>

                {/* Add the "Cancel Friendship" button */}
                <Pressable onPress={() => handleUnfriend(item.id)}>
                    <Text style={styles.unfriendButton}>Hủy kết bạn</Text>
                </Pressable>
            </View>
        </Pressable>
    );

    //model đóng bài 
    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedFriend(null);
    };

    //-------------------------Main------------------------------------------------------
    return (
        <ScreenWrapper>
            {/* Header */}
            <Header title="Danh sách bạn bè" showBackButton={false} />

            {/* Search Input */}
            <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bạn bè..."
                value={searchText}
                onChangeText={handleSearch}
            />

            {loading ? (
                <Loading /> // Show loading indicator
            ) : (
                <FlatList
                    data={filteredFriends}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text>Không tìm thấy bạn bè</Text>
                        </View>
                    )}
                />
            )}

            {/*-------------------------------------MODEL KẾT BẠN---------------------------*/}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.friendPostBG}>
                    <ScrollView>
                        <Header title='Trang bạn bè' showBackButton={false} />
                        {selectedFriend && (
                            <View style={{ gap: 15 }}>
                                {/*Avatar */}
                                <View style={styles.avatarContainer}>
                                    <Avatar
                                        uri={getSupabaseFileUrl(selectedFriend?.avatar_url) || "https://via.placeholder.com/150"}
                                        size={hp(12)}
                                        rounded={theme.radius.xxl * 1.4}
                                    />
                                </View>
                                {/*Tên và khoa*/}
                                <View style={{ alignItems: 'center', gap: 4 }}>
                                    <Text style={styles.userNamePR}>{selectedFriend?.name}</Text>
                                    <Text style={styles.infoText}>Khoa khoa học và kĩ thuật máy tính</Text>
                                </View>
                            </View>
                        )}

                        <FlatList
                            data={posts}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listStyle}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <PostCard
                                    item={item}
                                    currentUser={selectedFriend}
                                    router={router}
                                    hasShadow={true}
                                />
                            )}
                            onEndReached={() => {
                                getPosts(String(selectedFriend?.id));
                            }}
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

                    </ScrollView>
                    {/*Header */}

                </View>

            </Modal>
        </ScreenWrapper>

    );
};

export default ListFriend;

//-------------------------CSS------------------------------------------------------
const styles = StyleSheet.create({
    searchInput: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: theme.radius.sm,
        paddingHorizontal: 10,
        marginVertical: 10,
        marginHorizontal: 20,
        backgroundColor: "#f9f9f9",
    },
    friendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(2),
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: theme.radius.sm,
        elevation: 3,
    },
    userName: {
        flex: 1,
        fontSize: 16,
        marginLeft: wp(4),
        color: theme.colors.text,
    },
    listContainer: {
        padding: 20,
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    friendPostBG: {
        backgroundColor: 'white'
    },

    //-------------------------------------------------------
    avatarContainer: {
        height: hp(12),
        width: hp(12),
        alignSelf: 'center',
    },
    userNamePR: {
        fontSize: hp(3),
        fontWeight: '600',
        color: theme.colors.textDark,
    },
    infoText: {
        fontSize: hp(1.6),
        fontWeight: '500',
        color: theme.colors.textLight,
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
    unfriendButton: {
        backgroundColor: 'red',  // Red background color
        color: 'white',  // White text color
        fontSize: hp(1.8),
        fontWeight: 'bold',
        paddingVertical: hp(1),  // Vertical padding to make the button more clickable
        paddingHorizontal: wp(4),  // Horizontal padding for more space
        textAlign: 'center',  // Centers the text horizontally
        borderRadius: theme.radius.sm,  // Rounded corners (adjust the size if needed)
        alignItems: 'center',  // Vertically center the text
        justifyContent: 'center',  // Horizontally center the text
    },
});
