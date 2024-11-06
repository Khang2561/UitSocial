import { hp } from '@/helpers/common';
import { getSupabaseFileUrl } from '@/services/imageService';
import { router } from 'expo-router';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@/components/Avatar';

// Define the prop types for ChatItem
type ChatItemProps = {
    item: {
        id: string;
        name: string;
        image: string;
        time: string;
        latest_message?: string;
    };
};

const ChatItem = ({ item }: ChatItemProps) => {

    const openChatRoom = () => {
        router.push({ pathname: '/chatRoom', params: item });
    };

    return (
        <TouchableOpacity style={styles.container} onPress={openChatRoom}>
            {/* Avatar component with fallback URL */}
            <Avatar
                uri={getSupabaseFileUrl(item.image) || "https://via.placeholder.com/150"}
                style={styles.avatar}
            />
            
            {/* User details and message preview */}
            <View style={styles.textContainer}>
                <Text style={styles.userName}>{item.name}</Text>

                <View style={styles.messageRow}>
                    <Text style={styles.latestMessage}>
                        {item.latest_message || 'No messages yet'}
                    </Text>
                    <Text style={styles.time}>
                        {item.time || 'N/A'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',  // Ensure vertical alignment
    },
    avatar: {
        height: hp(8),
        width: hp(8),
        borderRadius: hp(8) / 2,
        aspectRatio: 1,
        flexShrink: 0,  // Prevent shrinking of the avatar image
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
        alignItems: 'center',  // Align text items in the same row
    },
    latestMessage: {
        fontSize: 14,
        color: '#666',  // Gray color for the latest message
        flexShrink: 1,  // Ensure message text shrinks if needed
    },
    time: {
        fontSize: 12,
        color: '#aaa',  // Lighter gray for the timestamp
    },
});

export default ChatItem;
