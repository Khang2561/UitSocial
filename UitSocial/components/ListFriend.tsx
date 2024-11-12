import { StyleSheet, Text, View, Pressable, TextInput, FlatList } from "react-native";
import ScreenWrapper from "./ScreenWrapprer";
import Header from "./Header";
import { useState } from "react";
import Loading from "./Loading";
import { fetchPosts } from "@/services/postService";
import { getSupabaseFileUrl } from "@/services/imageService";
import Avatar from "./Avatar";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";

const ListFriend = (userID : any) => {
    //-------------------------CONST------------------------------------------------------
    const [searchText, setSearchText] = useState("");
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [postLimit, setPostLimit] = useState(15);
    const [isModalVisible, setIsModalVisible] = useState(false);

    //-------------------------Function------------------------------------------------------
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
    //gôm add friend và request lại 
    const getCombinedUsers = () => {
        
    };

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

    //nhấn vào trang bạn bè 
    const handleSelectFriend = (friendData: any) => {
        setSelectedFriend(friendData);
        setPosts([]);
        setHasMore(true);
        setPostLimit(15); // Reset limit when a new friend is selected
        getPosts(); // Fetch posts for the new friend
        setIsModalVisible(true);
    };

    //Render Item ket ban
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

            </View>
        </Pressable>
    );

    //-------------------------Main------------------------------------------------------
    return (
        <ScreenWrapper>
            {/*Header*/}
            <Header title="Danh sách bạn bè" showBackButton={false}/>
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
        </ScreenWrapper>
    );
};

export default ListFriend;
//-------------------------CSS------------------------------------------------------
const styles = StyleSheet.create({
   searchInput:{

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
});
