import ScreenWrapper from "@/components/ScreenWrapprer";
import React, { useEffect, useState } from 'react';
import { wp } from "@/helpers/common";
import { Text, StyleSheet, View, FlatList, TextInput } from 'react-native';
import { useAuth } from "@/contexts/AuthContext";
import ChatItem from "@/components/ChatItem";
import Loading from '@/components/Loading';
import { fetchLatestMessageTime, getAvailableUsers, getRoomId } from "@/services/chatService";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from "@/lib/supabase";

const ChatList: React.FC = () => {
    //------------------------------CONST------------------------------------------
    const { user } = useAuth();
    const [search, setSearch] = useState(""); 
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    //-----------------------------FUNCTION-----------------------------------
    useEffect(() => {
        getUser();
    }, [user.id]);

    // Lấy danh sách người chat
    const getUser = async () => {
        setLoading(true);
        try {
            const res = await getAvailableUsers(user.id);
            if (res.success) {
                const usersWithRoomData = await Promise.all(
                    res.data.map(async (u: any) => {
                        const roomId = await getRoomId(user.id, u.id);
                        const latestMessageTime = await fetchLatestMessageTime(roomId); // Lấy thời gian tin nhắn mới nhất
                        return { ...u, roomId, latestMessageTime };
                    })
                );
                // Sắp xếp users theo thời gian tin nhắn mới nhất
                const sortedUsers = usersWithRoomData.sort((a, b) => 
                    new Date(b.latestMessageTime).getTime() - new Date(a.latestMessageTime).getTime()
                );
                setUsers(sortedUsers);
            } else {
                console.error(res.msg);
            }
        } catch (error) {
            console.error("Failed to fetch available users:", error);
        } finally {
            setLoading(false);
        }
    };
    // Theo dõi tin nhắn mới và cập nhật danh sách `users`
    useEffect(() => {
        const messageSubscription = supabase
            .channel('realtime:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                const updatedRoomId = payload.new.room_id;
                const updatedMessageTime = payload.new.created_at;

                // Cập nhật lại users với thông tin mới nhất về tin nhắn
                setUsers(prevUsers => {
                    const updatedUsers = prevUsers.map(user => 
                        user.roomId === updatedRoomId
                            ? { ...user, latestMessageTime: updatedMessageTime }
                            : user
                    );

                    // Sắp xếp lại danh sách người dùng theo thời gian tin nhắn mới nhất
                    const sortedUsers = updatedUsers.sort((a, b) => 
                        new Date(b.latestMessageTime || 0).getTime() - new Date(a.latestMessageTime || 0).getTime()
                    );

                    return sortedUsers;
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(messageSubscription);
        };
    }, []);  // Chỉ thực hiện 1 lần khi component mount

    // Tìm kiếm bạn bè để chat
    const updateSearch = (searchText: string) => {
        setSearch(searchText);
    }; 

    // Lọc người dùng theo từ khóa tìm kiếm
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    //-----------------------------------MAIN-------------------------------
    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Text style={styles.title}>Chats</Text>
                <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search"
                        value={search}
                        onChangeText={updateSearch}
                        style={styles.searchInput}
                    />
                </View>
            </View>
          
            <View>
                {loading ? (
                    <Loading/>
                ) : filteredUsers.length === 0 ? (
                    <Text style={styles.NoOne}>No users found</Text>
                ) : (
                    <FlatList
                        data={filteredUsers} 
                        contentContainerStyle={{ flexGrow: 1, paddingVertical: 25 }}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <ChatItem item={item} />
                        )}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

//-----------------------------------CSS-------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginHorizontal: wp(4),
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6e6e6',
        borderRadius: 10,
        height: 40,
        width: '100%',
        paddingHorizontal: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#000',
    },
    NoOne: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginTop: 50,
    }
});

export default ChatList;
