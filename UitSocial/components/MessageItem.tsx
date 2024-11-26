import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

type MessageItemProps = {
    message: {
        id: string;
        text: string;
        senderId: string;
        created_at: string; 
    };
    currentUser: boolean;
}

const MessageItem = memo (({ message, currentUser }: MessageItemProps) => {
    return (
        <View style={[styles.messageContainer, currentUser ? styles.currentUser : styles.otherUser]}>
            <Text style={styles.messageText}>{message.text}</Text>
        </View>
    );
});

const styles = StyleSheet.create({
    messageContainer: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        maxWidth: '100%',
    },
    currentUser: {
        backgroundColor: '#DCF8C6', // Light green for current user's messages
    },
    otherUser: {
        backgroundColor: '#E5E5EA', // Light gray for other user's messages
    },
    messageText: {
        fontSize: 16,
        color: '#000',
    },
});

export default MessageItem;
