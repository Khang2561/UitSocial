import { ScrollView } from "react-native";
import MessageItem from "./MessageItem";

interface MessageListProps {
   messages: any;
   currentUser: any;
};

const MessagesList = ({ messages, currentUser }:MessageListProps) => {
    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>
            {messages.map((message: any, index: any) => (
                <MessageItem 
                    message={message} 
                    key={index} 
                    currentUser={message.senderId === currentUser} 
                />
            ))}
        </ScrollView>
    );
};

export default MessagesList;
