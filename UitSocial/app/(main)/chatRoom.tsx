import ChatRoomHeader from "@/components/ChatRoomHeader";
import Input from "@/components/Input";
import MessagesList from "@/components/MessageList";
import ScreenWrapper from "@/components/ScreenWrapprer";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  createChatRoom,
  getRoomId,
  sendMessage,
  fetchMessages,
} from "@/services/chatService";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Icon } from "react-native-elements";

const ChatRoom = () => {
  const item = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const loadMessages = async () => {
      // Create chat room if it doesn't exist
      await createChatRoom(user.id, item.id);
      // Fetch the roomId after ensuring the chat room is created
      const roomId = await getRoomId(user.id, item.id);

      // Fetch existing messages from the room
      const result = await fetchMessages(roomId);
      if (result.success) setMessages(result.data || []);

      // Set up the real-time subscription after roomId is available
      const subscription = supabase
        .channel(`messages-room-${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `roomId=eq.${roomId}`,
          },
          (payload: any) => {
            setMessages((prev) => {
              // Only add if the message ID is not already in the list
              return prev.some((msg) => msg.id === payload.new.id)
                ? prev
                : [...prev, payload.new];
            });
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe(); // Cleanup the subscription when the component unmounts
      };
    };

    loadMessages();
  }, [item.id, user.id]); // This effect will run whenever item.id or user.id changes

  const handleSendMessage = async () => {
    const messageText = text.trim();
    if (!messageText) return;

    setText(""); // Clear input immediately

    try {
      const roomId = await getRoomId(user.id, item.id);
      const result = await sendMessage(user.id, roomId, messageText);

      if (result.success && result.data) {
        setMessages((prevMessages) =>
          prevMessages.some((msg) => msg.id === result.data[0].id)
            ? prevMessages // Avoid duplicate
            : [...prevMessages, result.data[0]]
        );
      } else {
        console.error(result.msg || "Failed to send the message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // Adjust if needed
      >
        <View style={styles.container}>
          <ChatRoomHeader user={item} />

          <View style={{ flex: 1 }}>
            <MessagesList
              messages={messages}
              currentUser={user}
              receiver={item}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon
              name="camera-alt"
              size={24}
              color={theme.colors.text}
              onPress={() => {
                /* Handle camera action */
              }}
            />
            <Icon
              name="image"
              size={24}
              color={theme.colors.text}
              onPress={() => {
                /* Handle image selection */
              }}
              containerStyle={{ marginLeft: 10 }}
            />
            <Input
              placeholder="Aa"
              value={text}
              onChangeText={setText}
              containerStyles={styles.input}
            />
            <Icon
              name="send"
              size={24}
              color={theme.colors.text}
              onPress={handleSendMessage}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    height: 40,
    borderColor: theme.colors.textLight,
    marginHorizontal: 10,
  },
});

export default ChatRoom;
