import { View, Text, StyleSheet } from "react-native";

type MessageItemProps = {
    message: any;
    currentUser: any;
}


const MessageItem = ({ message, currentUser }:MessageItemProps) => {
    return (
        <View style={[styles.messageContainer, currentUser ? styles.currentUser : styles.otherUser]}>
            <Text style={styles.messageText}>{message.text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        maxWidth: '80%',
    },
    currentUser: {
        backgroundColor: '#DCF8C6', // Light green for current user's messages
        alignSelf: 'flex-end',
    },
    otherUser: {
        backgroundColor: '#E5E5EA', // Light gray for other user's messages
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
    },
});

export default MessageItem;
