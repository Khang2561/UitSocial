import ScreenWrapper from "@/components/ScreenWrapprer"
import React, { FC, useEffect, useState } from 'react';
import { wp } from "@/helpers/common";
import { Text, StyleSheet, View, FlatList } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import ChatItem from "@/components/ChatItem";
import { getAvailableUsers, getUserData } from "@/services/userService";
import Loading from '@/components/Loading';


const ChatList: React.FC = () => {
    const {user} = useAuth();
    const router = useRouter();
    const [search, setSearch] = useState(""); 
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const updateSearch = (searchText: string) => {
        setSearch(searchText);
    };

    const getUser = async ()=>{
        setLoading(true);
        try {
            const res = await getAvailableUsers(user.id); // Call the function with the current user id
            console.log(res); 
            if (res.success) {
                setUsers(res.data || []); // Update the state with the fetched users
            } else {
                console.error(res.msg); 
            }
        } catch (error) {
            console.error("Failed to fetch available users:", error); 
        } finally {
            setLoading(false);
        }     
    }

    useEffect(() => {
        getUser();
    },[user.id])

    return (
        <ScreenWrapper>
          <View style={styles.header}>
                <Text style={styles.title}>Chats</Text>
                <SearchBar
                    placeholder="Search"
                    value={search}
                    onChangeText={updateSearch}
                    lightTheme
                    round
                    containerStyle={styles.searchContainer}
                    inputContainerStyle={styles.searchInputContainer}
                    inputStyle={styles.searchInput}
                />
          </View>
          
          <View>
            {loading ? (
                <Loading /> // Display a loading component
            ) : users.length === 0 ? (
                <Text>No users found</Text>
            ) : (
                <FlatList
                    data={users}
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
    item: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    searchContainer: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        width: '100%',
    },
    searchInputContainer: {
        backgroundColor: '#e6e6e6',
        borderRadius: 10,
        height: 40, 
    },
    searchInput: {
        color: '#000', 
    },
  });
  
  export default ChatList;


