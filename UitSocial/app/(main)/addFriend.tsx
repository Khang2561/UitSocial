import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from "react-native";
import Avatar from "@/components/Avatar";
import { theme } from "@/constants/theme";
import ScreenWrapper from "@/components/ScreenWrapprer";
import { hp, wp } from "@/helpers/common";
import Header from "@/components/Header";
import { getAvailableUsersForFriends } from "@/services/userService"; // Import hàm lấy dữ liệu từ Supabase
import { useAuth } from "@/contexts/AuthContext"; // Lấy thông tin người dùng hiện tại
import { getSupabaseFileUrl } from "@/services/imageService";

const AddFriend = () => {
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");
    const { user } = useAuth(); // Lấy user hiện tại

    useEffect(() => {
        // Gọi API để lấy danh sách người dùng có thể kết bạn
        const fetchAvailableUsers = async () => {
            const result = await getAvailableUsersForFriends(user.id);
            if (result.success) {
                setFilteredUsers(result.data || []); // Đảm bảo `result.data` luôn là một mảng
            } else {
                setFilteredUsers([]); // Nếu không lấy được dữ liệu, set thành mảng rỗng
            }
        };
    
        fetchAvailableUsers();
    }, [user.id]);
    

    // Hàm xử lý kết bạn
    const handleAddFriend = (id: string) => {
        setFilteredUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === id ? { ...user, isFriend: true } : user
            )
        );
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = (text: string) => {
        setSearchText(text);

        // Cập nhật danh sách tìm kiếm dựa trên tên người dùng
        if (text.length > 0) {
            const filteredData = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredUsers(filteredData);
        } else {
            setFilteredUsers(filteredUsers);
        }
    };

    // Render từng người trong danh sách
    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.friendItem}>
            <Avatar
                uri={getSupabaseFileUrl(item?.image) || "https://via.placeholder.com/150"}
                size={hp(6)}
                rounded={theme.radius.sm}
            />
            <Text style={styles.userName}>{item.name}</Text>
            <Pressable
                style={[
                    styles.addButton,
                    item.isFriend ? styles.requestedButton : null,
                ]}
                onPress={() => handleAddFriend(item.id)}
                disabled={item.isFriend}
            >
                <Text style={styles.addButtonText}>
                    {item.isFriend ? "Requested" : "Add Friend"}
                </Text>
            </Pressable>
        </View>
    );

    return (
        <ScreenWrapper>
            <Header title="Thêm bạn bè" />

            {/* Search bar */}
            <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bạn bè..."
                value={searchText}
                onChangeText={handleSearch}
            />

            {/* FlatList Friend */}
            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text>Không tìm thấy bạn bè</Text>
                    </View>
                )}
            />
        </ScreenWrapper>
    );
};

export default AddFriend;

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
});
