import React, { useRef, useCallback, useState } from "react";
import { FlatList, FlatListProps, StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import MessageItem from "./MessageItem";
import Avatar from "./Avatar";
import { getSupabaseFileUrl } from "@/services/imageService";
import { Video } from 'expo-av';

interface Message {
    id: string;
    text: string;
    senderId: string;
    created_at: string;
    file?: string; // fileUrl đổi thành file
    fileType?: 'image' | 'video';
}

interface MessageListProps {
    messages: Message[];
    currentUser: { id: string };
    receiver: any;
    onLoadPrevMessages: () => void;
}

const MessagesList = ({ messages, currentUser, receiver, onLoadPrevMessages }: MessageListProps) => {
    //---------------------------------------------CONST---------------------------------------------------------
    const flatListRef = useRef<FlatList<Message>>(null);
    const [timeVisibleMessageId, setTimeVisibleMessageId] = useState<string | null>(null); // State để theo dõi khi nào hiển thị thời gian

    //-------------------------------------------FUNCTION---------------------------------------------------------
    //----------------Hàm chuyển đổi thời gian tin nhắn từ chuỗi sang định dạng dễ đọc-------------

    const formatTime = (time: string) => {
        // Remove microseconds if present
        const formattedTime = time.split('.')[0]; // Strips off the microseconds
        const date = new Date(formattedTime);
        // Chuyển đổi sang múi giờ Việt Nam (UTC+7)
        const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000); // Cộng thêm 7 giờ
        const now = new Date();
        const isSameDay = vietnamTime.toDateString() === now.toDateString(); // Kiểm tra nếu là ngày hôm nay
        // Chuyển đổi sang giờ địa phương của Việt Nam (hệ thống sẽ tự điều chỉnh múi giờ)
        const localTime = vietnamTime.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // Nếu muốn hiển thị định dạng 12 giờ
        });
        // Nếu là ngày hôm nay, chỉ hiển thị giờ, nếu không hiển thị ngày theo định dạng dd/mm/yy
        const dateFormatted = isSameDay
            ? localTime
            : `${vietnamTime.getDate().toString().padStart(2, '0')}/${(vietnamTime.getMonth() + 1).toString().padStart(2, '0')}/${vietnamTime.getFullYear().toString().slice(-2)} ${localTime}`;
        return dateFormatted;
    };


    //-------------------------RENDER RA TIN NHẮN------------------------------------------------- 
    const renderItem: FlatListProps<Message>["renderItem"] = useCallback(
        ({ item, index }: { item: Message; index: number }) => {
            const isReceiver = item.senderId === receiver.id;
            const isCurrentUser = item.senderId === currentUser.id;

            // Kiểm tra nếu ngày của tin nhắn thay đổi
            const isNewDay = index === 0 || new Date(messages[index - 1].created_at).toDateString() !== new Date(item.created_at).toDateString();

           
            //--------------Hàm để dự đoán fileType dựa trên đuôi của URL-------------------------------
            const getFileType = (url: string) => {
                const extension = url.split('.').pop()?.toLowerCase(); // Lấy phần mở rộng của file
                if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
                    return 'image';
                } else if (extension === 'mp4') {
                    return 'video';
                }
                return undefined; // Nếu không phải ảnh hay video, trả về undefined
            };

            item.fileType = item.file ? getFileType(item.file) : undefined; // Xác định loại file dựa trên URL
            const isMediaOnly = item.fileType === 'image' || item.fileType === 'video'; // Kiểm tra xem có phải chỉ là media không
            const isMessage = item.text === '';

            return (
                <View>
                    {isNewDay && (
                        <View style={styles.dateSeparator}>
                            <Text style={styles.dateText}>{formatTime(item.created_at).split(' ')[0]}</Text>
                        </View>
                    )}
                    <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.receiverMessage]}>
                        <TouchableOpacity onPress={() => setTimeVisibleMessageId((prevId) => (prevId === item.id ? null : item.id))}>
                        <View>
                            {!isMessage && <MessageItem message={item} currentUser={isCurrentUser} />}
                        </View>
                        <View>
                            {item.file && item.fileType === 'image' && (
                                <Image source={{ uri: String(item.file) }} style={styles.media} />
                            )}
                            {item.file && item.fileType === 'video' && (
                                <Video
                                    source={{ uri: String(item.file) }}
                                    style={styles.media}
                                    useNativeControls
                                />
                            )}
                        </View>
                        </TouchableOpacity>
                        {timeVisibleMessageId === item.id && (
                            <Text style={styles.timeText}>{formatTime(item.created_at)} </Text>
                        )}
                    </View>
                </View>
            );
        },
        [receiver, currentUser, messages, timeVisibleMessageId]
    );

    //-------------------------------------------------MAIN------------------------------------------------------------
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

//------------------------------------------------------css---------------------------------------
const styles = StyleSheet.create({
    flatList: {
        paddingTop: 10,
    },
    messageContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        marginBottom: 5,
    },
    currentUserMessage: {
        alignSelf: "flex-end",
    },
    receiverMessage: {
        justifyContent: "flex-start",
        alignSelf: "flex-start",
    },
    media: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    timeText: {
        fontSize: 12,
        color: "gray",
        marginTop: 5,
        marginLeft: 5,
    },
    dateSeparator: {
        width: "100%",
        alignItems: "center",
        marginVertical: 10,
    },
    dateText: {
        fontSize: 14,
        color: "gray",
        textAlign: "center",
        backgroundColor: "#f0f0f0", // Màu nền nhẹ để dễ nhận diện
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 10,
        opacity: 0.7, // Mờ nhẹ cho hiệu ứng
    },
    avatar: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
});

export default React.memo(MessagesList);
