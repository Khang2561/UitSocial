import ScreenWrapper from "@/components/ScreenWrapprer";
import React, { useEffect, useState } from 'react';
import { wp } from "@/helpers/common";
import { Text, StyleSheet, View, FlatList, TextInput } from 'react-native';
import { useAuth } from "@/contexts/AuthContext";
import ChatItem from "@/components/ChatItem";
import Loading from '@/components/Loading';
import { getAvailableUsers } from "@/services/chatService";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure you have this library installed

const ChatList: React.FC = () => {
    const { user } = useAuth();
    const [search, setSearch] = useState(""); 
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const updateSearch = (searchText: string) => {
        setSearch(searchText);
    }; 

    const getUser = async () => {
        setLoading(true);
        try {
            const res = await getAvailableUsers(user.id);
            if (res.success) {
                setUsers(res.data || []);
            } else {
                console.error(res.msg); 
            }
        } catch (error) {
            console.error("Failed to fetch available users:", error); 
        } finally {
            setLoading(false);
        }     
    };

    useEffect(() => {
        getUser();
    }, [user.id]);

    // Filter users based on the search input
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase())
    );

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
                    <Text>No users found</Text>
                ) : (
                    <FlatList
                        data={filteredUsers} 
                        contentContainerStyle={{ flexGrow: 1, paddingVertical: 25 }}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => <ChatItem item={item} />}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

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
});

export default ChatList;
