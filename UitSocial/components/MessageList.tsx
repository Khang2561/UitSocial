import React, { useRef, useCallback, useState } from "react";
import { FlatList, FlatListProps, StyleSheet, View } from "react-native";
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
    onLoadPrevMessages: () => void;
}

const MessagesList = ({ messages, currentUser, receiver, onLoadPrevMessages }: MessageListProps) => {
    const flatListRef = useRef<FlatList<Message>>(null);

    const renderItem: FlatListProps<Message>["renderItem"] = useCallback(
        ({ item, index }: { item: Message; index: number }) => {
            const isReceiver = item.senderId === receiver.id;
            const isCurrentUser = item.senderId === currentUser.id;

            // Show avatar only for the last message in a series from the receiver
            const isLastReceiverMessage =
                isReceiver &&
                (index === 0 || messages[index - 1].senderId !== receiver.id);

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
        <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            inverted={true} // Make sure the list is inverted to show the latest messages at the bottom
            contentContainerStyle={styles.flatList}
            onEndReached={onLoadPrevMessages} // Trigger the function when reaching the end of the list
            onEndReachedThreshold={0.5} // Adjust as needed for when to trigger
        />
    );
    
};

const styles = StyleSheet.create({
    flatList: {
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
