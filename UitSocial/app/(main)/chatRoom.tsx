import ChatRoomHeader from "@/components/ChatRoomHeader";
import Input from "@/components/Input";
import MessagesList from "@/components/MessageList";
import ScreenWrapper from "@/components/ScreenWrapprer";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { createChatRoom, getRoomId, sendMessage, fetchMessages } from "@/services/chatService";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Icon } from "react-native-elements";

const ChatRoom = () => {
    const item = useLocalSearchParams();
    const [messages, setMessages] = useState<any[]>([]); 
    const { user } = useAuth();
    const [text, setText] = useState('');

    useEffect(() => {
        const loadMessages = async () => {
            try {
                await createChatRoom(user.id, item.id);

                const roomId = await getRoomId(user.id, item.id);

                const result = await fetchMessages(roomId);

                if (result.success) {
                    // Ensure we set messages to an array, even if result.data is undefined
                    setMessages(result.data || []);
                } else {
                    console.error(result.msg);
                }
            } catch (error) {
                console.error("Error loading chat room:", error);
            }
        };

        loadMessages();
    }, []);

    const handleSendMessage = async () => {
        let message = text.trim();
        if (!message) return;
    
        try {
            const roomId = await getRoomId(user.id, item.id);
    
            const result = await sendMessage(user.id, roomId, message);
    
            // Check if result.data exists and is not empty before accessing result.data[0]
            if (result.success && result.data && result.data.length > 0) {
                setMessages(prevMessages => [...prevMessages, result.data[0]]);
                setText('');
            } else {
                console.error(result.msg || "No message returned from sendMessage.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };    

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ChatRoomHeader user={item} />
                
                <View style={{flex: 1}}>
                    <MessagesList messages={messages} currentUser={user.id} />
                </View>

                <View style={styles.inputWrapper}>
                    <Icon 
                        name="camera-alt" 
                        size={24} 
                        color={theme.colors.text} 
                        onPress={() => {/* Handle camera action */}} 
                    />
                    <Icon 
                        name="image"
                        size={24} 
                        color={theme.colors.text} 
                        onPress={() => {/* Handle image selection */}}
                        containerStyle={{marginLeft: 10}}
                    />
                    <Input
                        placeholder="Aa"
                        value={text}
                        onChangeText={setText}
                        containerStyles={styles.input}
                    />
                    <Icon name="send" size={24} color={theme.colors.text} onPress={handleSendMessage} />
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
    },
    inputWrapper: {
        flexDirection: 'row',  
        alignItems: 'center',  
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    input: {
        flex: 1, 
        borderWidth: 1,
        borderRadius: 25,
        height: 40,
        borderColor: theme.colors.textLight,
        marginRight: 10,
        marginLeft: 10,
    },
});

export default ChatRoom;
