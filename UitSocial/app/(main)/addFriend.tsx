import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Avatar from '@/components/Avatar';
import { theme } from '@/constants/theme';
import ScreenWrapper from '@/components/ScreenWrapprer';
import { hp, wp } from '@/helpers/common';
import Header from '@/components/Header';
import { getAvailableUsersForFriends, sendFriendRequest, fetchFriendRequests, acceptFriendRequest } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseFileUrl } from '@/services/imageService';
import Icon2 from 'react-native-vector-icons/Feather';
import Icon3 from 'react-native-vector-icons/Entypo';
import { useRouter } from 'expo-router';
import PostCard from '@/components/PostCard';
import { fetchPosts } from '@/services/postService';
import Loading from '@/components/Loading';





const AddFriend = () => {
    //-------------------------------------------CONST-------------------------------------------------------
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { user } = useAuth();

    const [posts, setPosts] = useState<any[]>([]);
    const router = useRouter();
    const [hasMore, setHasMore] = useState(true);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [postLimit, setPostLimit] = useState(15);
    const [loading, setLoading] = useState(false);

    const [friendRequests, setFriendRequests] = useState<any[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const [successRequestId, setSuccessRequestId] = useState<string | null>(null); // Thêm state để lưu ID yêu cầu kết bạn thành công


    //---------------------------------------------FUNCTION-----------------------------------------------------
    useEffect(() => {
        fetchAvailableUsers();
        fetchFriendRequestsData();
        if (selectedFriend) {
            getPosts(); // Gọi hàm getPosts khi selectedFriend thay đổi
        }
    }, [user.id, selectedFriend]);

    //lấy thông tin người gửi yêu cầu kết bạn 
    const fetchFriendRequestsData = async () => {
        setLoadingRequests(true);
        try {
            const result = await fetchFriendRequests(user.id);
            // Log kết quả trả về từ API
            console.log("Result from fetchFriendRequests:", result);

            if (result.success) {
                // Log dữ liệu yêu cầu kết bạn
                console.log("Friend requests data:", result.data);
                setFriendRequests(result.data || []);
            }
            else {
                console.error(result.msg);
                setFriendRequests([]);
            }
        } catch (error) {
            console.error("That ban lay danh sanh yeu cau ket ban :", error);
        } finally {
            setLoadingRequests(false);
        }
    }

    //danh sách bạn có thể kết bạn 
    const fetchAvailableUsers = async () => {
        setLoading(true);
        try {
            const result = await getAvailableUsersForFriends(user.id);
            if (result.success) {
                setAllUsers(result.data || []);
                setFilteredUsers(result.data || []);
            } else {
                console.error(result.msg); // Log the error message
                setFilteredUsers([]);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error); // Catch and log any unforeseen errors
        } finally {
            setLoading(false);
        }
    };


    //gửi lời mời kết bạn 
    const handleAddFriend = async (friendId: string) => {
        const result = await sendFriendRequest(user.id, friendId)//goi api cho ket ban 

        if (result.success) {
            setFilteredUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === friendId ? { ...user, isFriend: true } : user
                )
            );
        } else {
            console.log("Failed to send friend request:", result.msg);
        }
    }

    //hàm search bạn 
    const handleSearch = (text: string) => {
        setSearchText(text);
        if (text.length > 0) {
            const filteredData = allUsers.filter(user =>
                user.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredUsers(filteredData);
        } else {
            setFilteredUsers(allUsers); // Use allUsers when search is cleared
        }
    };

    //nhấn vào trang bạn bè 
    const handleSelectFriend = (friendData: any) => {
        setSelectedFriend(friendData);
        setPosts([]);
        setHasMore(true);
        setPostLimit(15); // Reset limit when a new friend is selected
        getPosts(); // Fetch posts for the new friend
        setIsModalVisible(true);
    };

    //model đóng bài 
    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedFriend(null);
    };
    //gôm add friend và request lại 
    const getCombinedUsers = () => {
        const friendRequestsWithFlag = friendRequests.map(req => ({
            ...req,
            isRequest: true,  // Đánh dấu là yêu cầu kết bạn
            isFriend: false,  // Không phải bạn
        }));

        const availableUsersWithFlag = filteredUsers.map(user => ({
            ...user,
            isRequest: false, // Không phải yêu cầu
        }));

        const mergedUsers = [...friendRequestsWithFlag, ...availableUsersWithFlag];
        return mergedUsers.sort((a, b) => (a.isRequest ? -1 : 1)); // Requests được ưu tiên hiển thị trước
    };

    //sử lý yêu cầu chấp nhận 
    const handleAcceptRequest = async (friendId: string) => {
        const result = await acceptFriendRequest(user.id, friendId);

        if (result.success) {
            console.log("--------------xu ly yeu cau ket ban thanh cong ---------------")
            setSuccessRequestId(friendId); // Lưu ID của bạn bè vào state
            
        } else {
            console.log("Lỗi chấp nhận kết bạn :", result.msg);
        }
    }

    //sử lý hủy 
    const handleCancelRequest = (friendId: string) => {

    }

    const renderItem = ({ item }: { item: any }) => (
        <Pressable onPress={() => handleSelectFriend(item)}>
            <View style={styles.friendItem}>
                {/* Avatar */}
                <Avatar
                    uri={getSupabaseFileUrl(item?.image) || "https://via.placeholder.com/150"}
                    size={hp(6)}
                    rounded={theme.radius.sm}
                />
                {/* Name */}
                <Text style={styles.userName}>{item.name}</Text>
                {item.isRequest && item.whoSend !== user.id ? (
                    successRequestId === item.id ? (  // Kiểm tra nếu yêu cầu đã được chấp nhận
                        <Text style={styles.successMessage}>Đã chấp nhận thành công!</Text> // Thông báo thành công
                    ) : (
                        <View style={styles.buttonContainer}>
                            {/* Nút chấp nhận */}
                            <Pressable
                                style={styles.acceptButton}
                                onPress={() => handleAcceptRequest(item.id)}  // Gọi hàm chấp nhận yêu cầu
                            >
                                <Text style={styles.acceptButtonText}>Chấp nhận</Text>
                            </Pressable>

                            {/* Nút hủy yêu cầu */}
                            <Pressable
                                style={styles.cancelButton}
                                onPress={() => handleCancelRequest(item.id)}  // Gọi hàm hủy yêu cầu
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </Pressable>
                        </View>
                    )
                ) : (
                    // Khi không có yêu cầu kết bạn, hiển thị nút "Thêm bạn" hoặc "Đã yêu cầu"
                    <Pressable
                        style={[styles.addButton, item.isFriend ? styles.requestedButton : null]}
                        onPress={() => handleAddFriend(item.id)}
                        disabled={item.isFriend}
                    >
                        <Text style={styles.addButtonText}>
                            {item.isFriend ? "Đã yêu cầu" : "Thêm bạn"}
                        </Text>
                    </Pressable>
                )}

            </View>
        </Pressable>
    );

    //function lấy bài post của bạn bè 
    const getPosts = async () => {
        if (!hasMore) return;

        const res = await fetchPosts(postLimit, selectedFriend?.id);
        if (res.success && res.data) {
            if (res.data.length < postLimit) setHasMore(false); // Check if more posts are available
            setPosts(prevPosts => [...prevPosts, ...res.data]);
        } else {
            setPosts([]);
            setHasMore(false);
        }
    };


    //-------------------------------------------------------MAIN-----------------------------------------------------------
    return (
        <ScreenWrapper>
            {/*Header */}
            <Header title="Thêm bạn bè" showBackButton={false} />
            {/*Nhập tìm kiếm bạn bè  */}
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
                    //data={filteredUsers}
                    data={getCombinedUsers()}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    onEndReached={() => {
                        setPostLimit(prevLimit => prevLimit + 15); // Increase limit when reaching end
                        getPosts();
                    }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text>Không tìm thấy bạn bè</Text>
                        </View>
                    )}
                />
            )}
            {/*Show thông tin những người bạn có thể kết bạn*/}

            {/*----------------------------Model show trang có nhân của bạn bè------------------------------------*/}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleCloseModal}
            >
                <ScreenWrapper>
                    <ScrollView>
                        <View>
                            <Header title='Trang bạn bè' showBackButton={false} />
                            {selectedFriend && (
                                <View style={{ gap: 15 }}>
                                    <View style={styles.avatarContainer}>
                                        <Avatar
                                            uri={getSupabaseFileUrl(selectedFriend?.image) || "https://via.placeholder.com/150"}
                                            size={hp(12)}
                                            rounded={theme.radius.xxl * 1.4}
                                        />
                                    </View>
                                    <View style={{ alignItems: 'center', gap: 4 }}>
                                        <Text style={styles.userNamePR}>{selectedFriend?.name}</Text>
                                        <Text style={styles.infoText}>Khoa khoa học và kĩ thuật máy tính</Text>
                                    </View>
                                    <View style={{ gap: 10 }}>
                                        <View style={styles.info}>
                                            <Icon3 name="email" size={20} color={theme.colors.textLight} />
                                            <Text style={styles.infoText}>
                                                {selectedFriend?.email || 'email@default.com'}
                                            </Text>
                                        </View>
                                        {selectedFriend?.phoneNumber && (
                                            <View style={styles.info}>
                                                <Icon2 name="phone-call" size={20} color={theme.colors.textLight} />
                                                <Text style={styles.infoText}>
                                                    {selectedFriend?.phoneNumber || 'xxxxxxxxxxxxxx'}
                                                </Text>
                                            </View>
                                        )}
                                        {selectedFriend?.address && (
                                            <View style={styles.info}>
                                                <Icon3 name="location" size={20} color={theme.colors.textLight} />
                                                <Text style={styles.infoText}>
                                                    {selectedFriend?.address || 'xxxxxxxxxxxxxx'}
                                                </Text>
                                            </View>
                                        )}
                                        {selectedFriend?.bio && (
                                            <View style={styles.info}>
                                                <Text style={styles.infoText}>
                                                    {selectedFriend?.bio || 'xxxxxxxxxxxxxx'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                        </View>
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
                                    hasShadow={true}
                                />
                            )}
                            onEndReached={() => {
                                getPosts();
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
                </ScreenWrapper>
            </Modal>
            {/*----------------------------Model show trang có nhân của bạn bè------------------------------------*/}
        </ScreenWrapper>
    );
};

export default AddFriend;
//------------------------------------------CSS--------------------------------------------------------
const styles = StyleSheet.create({
    listContainer: {
        padding: 20,
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
    addButton: {
        backgroundColor: 'blue',
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        borderRadius: theme.radius.md,
    },
    requestedButton: {
        backgroundColor: "gray",
    },
    addButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    searchInput: {
        margin: 20,
        padding: 10,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        backgroundColor: "#f9f9f9",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: wp(80),
        backgroundColor: '#fff',
        borderRadius: theme.radius.md,
        padding: 20,
        alignItems: 'center',
    },
    detailContainer: {
        alignItems: 'center',
    },
    detailName: {
        fontSize: hp(3),
        fontWeight: '600',
        color: theme.colors.textDark,
        marginTop: hp(2),
    },
    closeButton: {
        marginTop: hp(2),
        backgroundColor: 'blue',
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        borderRadius: theme.radius.md,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    //--------------------------------------------------------
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
    info: {
        flexDirection: 'row',
        gap: 10,
        marginLeft: 10
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
    //-------------------------------------------------
    requestItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(2),
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: theme.radius.sm,
        elevation: 3,
    },
    acceptButton: {
        backgroundColor: 'green',
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        borderRadius: theme.radius.md,
    },
    acceptButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    buttonContainer: {
        flexDirection: 'row',  // Đặt nút "Chấp nhận" và "Hủy" trong một hàng
        alignItems: 'center',
        marginLeft: 'auto',
        gap: 3
    },
    cancelButton: {
        backgroundColor: '#F44336', // Màu nền cho nút hủy
        paddingHorizontal: hp(1),
        paddingVertical: wp(2.75),
        borderRadius: theme.radius.md,
    },
    cancelButtonText: {
        color: '#fff',
    },
    successMessage:{
        color:'green',
    }
});
