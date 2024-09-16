import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from 'react';
import { theme } from "@/constants/theme";
import { hp, wp } from "@/helpers/common";
import Avatar from "./Avatar";
import { getSupabaseFileUrl } from "@/services/imageService";
import moment from "moment";
import Icon from 'react-native-vector-icons/Feather';

// Định nghĩa kiểu dữ liệu của item
type CommentItemProps = {
    item: {
        id: string;
        text: string;
        user: {
            id: string;
            name: string;
            image: string;
        };
        created_at: string;
        canDelete: boolean;
        highlight?: boolean;
    };
    onDelete: (comment: any) => void;
};

const CommentItem = ({ item, onDelete }: CommentItemProps) => {
    //-------------------------CONST------------------------------------------------------
    const uri = item?.user?.image ? getSupabaseFileUrl(item.user.image) : null;
    const createdAt = moment(item.created_at).format('YYYY MMM D');
    //-------------------------FUNCTION------------------------------------------------------
    const handleDelete = () => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa comment không?', [
            {
                text: 'Hủy',
                onPress: () => console.log('Hủy xóa comment'),
                style: 'cancel',
            },
            {
                text: 'Delete',
                onPress: () => onDelete(item),
                style: 'destructive',
            },
        ]);
    };

    //-------------------------Main------------------------------------------------------
    return (
        <View style={[styles.container, item.highlight && styles.highlight]}>
            {/* Avatar */}
            <Avatar uri={uri} />
            <View style={styles.content}>
                <View style={styles.header}>
                    {/* Name and Created At */}
                    <View>
                        <Text style={styles.nameText}>{item.user.name}</Text>
                        <Text style={[styles.text, { color: theme.colors.textLight }]}>{createdAt}</Text>
                    </View>
                    {/* Delete Icon */}
                    {item.canDelete && (
                        <TouchableOpacity onPress={handleDelete}>
                            <Icon name="trash-2" size={20} color={theme.colors.rose} />
                        </TouchableOpacity>
                    )}
                </View>
                {/* Comment Text */}
                <Text style={[styles.text, styles.commentText]}>{item.text}</Text>
            </View>
        </View>
    );
};

export default CommentItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 8,
    },
    content: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        flex: 1,
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: theme.radius.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nameText: {
        fontSize: hp(1.8),
        fontWeight: '600',
        color: theme.colors.textDark,
    },
    text: {
        fontSize: hp(1.6),
        fontWeight: '500',
        color: theme.colors.textDark,
    },
    commentText: {
        marginTop: 5,
        fontWeight: 'normal',
        color: theme.colors.text,
    },
    highlight: {
        backgroundColor: '#D1E7FF', // Màu nền nổi bật khi highlight
        borderColor: theme.colors.primary,         // Màu viền nổi bật
        borderWidth: 1,
        borderRadius: 12,
        shadowColor: theme.colors.primaryDark,     // Đổ bóng để phần tử nổi bật
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,                             // Thêm hiệu ứng nổi trên Android
    },
});
