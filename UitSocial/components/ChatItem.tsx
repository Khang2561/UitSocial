import { useState, useEffect, useCallback } from 'react';
import { hp } from '@/helpers/common';
import { getSupabaseFileUrl } from '@/services/imageService';
import { useFocusEffect, router } from 'expo-router';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@/components/Avatar';
import { fetchChatRooms } from '@/services/chatService';
import { supabase } from '@/lib/supabase';
import Icon from 'react-native-vector-icons/Entypo';

type ChatItemProps = {
    item: {
        id: string;
        name: string;
        image: string;
        time: string;
        latest_message?: string;
        roomId: string;
    };
};

const ChatItem = ({ item }: ChatItemProps) => {
    //----------------------------------------------CONST--------------------------------------------
    const [latestMessage, setLatestMessage] = useState<string>('No messages yet');
    const [messageTime, setMessageTime] = useState<string>('N/A');
    //---------------------------------------------MAIN---------------------------------------------------
    //HIỂN THỊ FORMAT DATATIME
    const formatDate = (dateString: string) => {
        const messageDate = new Date(dateString);
        const today = new Date();
        // So sánh ngày của tin nhắn và ngày hiện tại
        if (
            messageDate.getDate() === today.getDate() &&
            messageDate.getMonth() === today.getMonth() &&
            messageDate.getFullYear() === today.getFullYear()
        ) {
            return messageDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        } else {
            return messageDate.toLocaleDateString('en-GB');
        }
    };
    
    //LẤY TIN NHẮN MỚI NHẤT 
    const fetchLatestMessage = async () => {
        const result = await fetchChatRooms(item.roomId);
        if (result.success && result.data && result.data.length > 0) {
            const roomData = result.data[0];
            const sortedMessages = roomData.messages?.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            const latestMsg = sortedMessages?.[0];
            setLatestMessage(latestMsg?.text || <Icon name='video'/>);

            // Cập nhật thời gian hiển thị dựa vào hàm formatDate
            setMessageTime(latestMsg ? formatDate(latestMsg.created_at) : 'N/A');
        } else {
            console.error(result.message || "No data available");
        }
    };

    //CẬP NHẬP TIN NHẮN MỚI NHẤT NẾU CÓ TIN NHẮN MỚI 
    useFocusEffect(
        useCallback(() => {
            fetchLatestMessage();
            const messageSubscription = supabase
                .channel('realtime:messages')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                    if (payload.new.room_id === item.roomId) {
                        setLatestMessage(payload.new.text);
                        setMessageTime(formatDate(payload.new.created_at));
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(messageSubscription);
            };
        }, [item.roomId])
    );

    //SỰ KIỆN MỞ PHÒNG CHAT 
    const openChatRoom = () => {
        const { roomId, ...otherItemProps } = item;
        router.push({ pathname: '/chatRoom', params: { roomId, ...otherItemProps } });
    };

    //-------------------------------------MAIN---------------------------------------------------------
    return (
        <TouchableOpacity style={styles.container} onPress={openChatRoom}>
            <Avatar
                uri={getSupabaseFileUrl(item.image) || "https://via.placeholder.com/150"}
                style={styles.avatar}
            />
            <View style={styles.textContainer}>
                <Text style={styles.userName}>{item.name}</Text>
                <View style={styles.messageRow}>
                    <Text style={styles.latestMessage}>{latestMessage}</Text>
                    <Text style={styles.time}>{messageTime}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

//-------------------------------------------CSS-----------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',  
    },
    avatar: {
        height: hp(8),
        width: hp(8),
        borderRadius: hp(8) / 2,
        aspectRatio: 1,
        flexShrink: 0,  
    },
    textContainer: {
        marginLeft: 10,
        justifyContent: 'center',
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',  
    },
    latestMessage: {
        fontSize: 14,
        color: '#666',  
        flexShrink: 1,  
    },
    time: {
        fontSize: 12,
        color: '#aaa',  
    },
});

export default ChatItem;
