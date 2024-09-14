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
        id: string; // Thêm id vào comment
        text: string;
        user: {
            id: string;
            name: string;
            image: string;
        };
        created_at: string;
        canDelete: boolean;
        highlight? :boolean;
    };
    onDelete: (comment: any) => void;
  
};


const CommentItem = ({ item, onDelete }: CommentItemProps) => {
    //-------------------------CONST------------------------------------------------------
    const uri = item?.user?.image ? getSupabaseFileUrl(item.user.image) : null;
    const createdAt = moment(item.created_at).format('YYYY MMM D'); // Format the date
    const highlight = false;
    //-------------------------FUNCTION------------------------------------------------------
    const handleDelete = () =>{
        Alert.alert('Xác nhận','Bạn có chắc muốn xóa comment không ?',[
            {
                text:'Hủy',
                onPress:()=>console.log('huy xoa comment'),
                style:'cancel'
            },
            {
                text:'Delete',
                onPress:()=> onDelete(item),
                style:'destructive'
            }
        ])
    }
    //-------------------------Main------------------------------------------------------
    return (
        <View style={[styles.container,highlight && styles.highlight]}>
            {/* Image */}
            <Avatar uri={uri} />
            <View style={styles.content}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Name and Created At */}
                    <View>
                        <Text style={styles.nameText}>
                            {item.user.name}
                        </Text>
                        <Text style={[styles.text, { color: theme.colors.textLight }]}>
                            {createdAt}
                        </Text>
                    </View>
                    {/* Delete Icon */}
                    {
                        item.canDelete && (
                            <TouchableOpacity onPress={handleDelete}>
                                <Icon name='trash-2' size={20} color={theme.colors.rose} />
                            </TouchableOpacity>
                    )}
                </View>
                {/* Comment Text */}
                <Text style={[styles.text, styles.commentText]}>
                    {item.text}
                </Text>
            </View>
        </View>
    );
};

export default CommentItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        gap: 7,
        marginVertical: 5,
    },
    content: {
        backgroundColor: 'rgba(0,0,0,0.06)',
        flex: 1,
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: theme.radius.md,
        borderCurve: 'continuous',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    nameText: {
        fontSize: hp(1.6),
        fontWeight: '500',
        color: theme.colors.textDark,
    },
    text: {
        fontSize: hp(1.6),
        fontWeight: '500',
        color: theme.colors.textDark,
    },
    commentText: {
        marginTop: 5,  // Adds space between the user info and comment text
        fontWeight: 'normal',
    },
    highlight:{
        borderWidth:0.2,
        backgroundColor:'white',
        borderColor:theme.colors.dark,
        shadowColor:theme.colors.dark,
        shadowOffset:{width:0,height:0},
        shadowOpacity: 0.3,
        shadowRadius:8,
        elevation:5
    }
});
