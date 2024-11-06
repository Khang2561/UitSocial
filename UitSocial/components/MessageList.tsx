import React, { useRef, useEffect, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { FlashList, FlashListProps } from "@shopify/flash-list";
import MessageItem from "./MessageItem";
import Avatar from "./Avatar";
import { getSupabaseFileUrl } from "@/services/imageService";

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
}

interface MessageListProps {
    messages: Message[];
    currentUser: { id: string };
    receiver: any;
}

const MessagesList = ({ messages, currentUser, receiver }: MessageListProps) => {
    const flashListRef = useRef<FlashList<Message>>(null);

    // Scroll to the latest message when new messages are added
    useEffect(() => {
        if (messages.length > 0) {
            flashListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const renderItem: FlashListProps<Message>["renderItem"] = useCallback(
        ({ item, index }: { item: Message; index: number }) => {
            const isReceiver = item.senderId === receiver.id;
            const isCurrentUser = item.senderId === currentUser.id;

            // Show avatar only for the last message in a series from the receiver
            const isLastReceiverMessage =
                isReceiver &&
                (index === messages.length - 1 || messages[index + 1].senderId !== receiver.id);

            return (
                <View
                    style={[
                        styles.messageContainer,
                        isCurrentUser ? styles.currentUserMessage : styles.receiverMessage,
                    ]}
                >
                    {isLastReceiverMessage ? (
                        <Avatar
                            uri={getSupabaseFileUrl(receiver?.image) || "https://via.placeholder.com/150"}
                            style={styles.avatar}
                        />
                    ) : (
                        isReceiver && <View style={styles.avatarPlaceholder} />
                    )}

                    <MessageItem message={item} currentUser={isCurrentUser} />
                </View>
            );
        },
        [receiver, currentUser, messages.length]
    );

    return (
        <FlashList
            ref={flashListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            estimatedItemSize={60} // Set an estimated item height for optimized layout calculation
            contentContainerStyle={styles.flashList}
        />
    );
};

const styles = StyleSheet.create({
    flashList: {
        paddingTop: 10,
    },
    messageContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    currentUserMessage: {
        justifyContent: "flex-end",
        alignSelf: "flex-end",
        marginLeft: 40,
    },
    receiverMessage: {
        justifyContent: "flex-start",
        alignSelf: "flex-start",
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    avatarPlaceholder: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
});

export default React.memo(MessagesList);
