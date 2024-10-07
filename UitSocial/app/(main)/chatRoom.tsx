import ChatRoomHeader from "@/components/ChatRoomHeader";
import ScreenWrapper from "@/components/ScreenWrapprer";
import { useState } from "react";
import { View, StyleSheet } from "react-native";

const ChatRoom = () => {
    
    const [message, setMessages] = useState([]);

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <ChatRoomHeader/>
            </View>
        </ScreenWrapper>
        
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
      padding: 10,
    },
})

export default ChatRoom;