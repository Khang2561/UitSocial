import { ScrollView, StyleSheet, View, LogBox, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState, useRef } from "react"; // Thêm useRef
import { useLocalSearchParams, useRouter } from "expo-router";
import { createComment, fetchPostDetails } from "@/services/postService";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";
import Input from "@/components/Input";
import Icon from 'react-native-vector-icons/Feather';

LogBox.ignoreAllLogs(true);

const PostDetails = () => {
    //-------------------------CONST------------------------------------------------------
    const { postId } = useLocalSearchParams();
    const [post, setPost] = useState<any>(null);  // Khai báo kiểu dữ liệu của post là any
    const { user } = useAuth();
    const router = useRouter();
    const [startLoading, setStartLoading] = useState(true);
    const inputRef = useRef<any>(null);  // Sử dụng useRef cho inputRef
    const [loading, setLoading] = useState(false);
    const commentRef = useRef<string>('');  // Sử dụng useRef cho commentRef

    //-------------------------Function------------------------------------------------------
    useEffect(() => {
        getPostDetails();
    }, []);

    const getPostDetails = async () => {
        let res = await fetchPostDetails(postId);
        if (res.success) {
            setPost(res.data);
        }
        setStartLoading(false);
    }

    if (startLoading) {
        return (
            <View style={styles.center}>
                <Loading />
            </View>
        )
    }

    const onNewComment = async () => {
        if (!commentRef.current) return null;
        let data = {
            userId: user?.id,  // Kiểm tra chắc chắn user và post có id
            postId: post?.id,
            text: commentRef.current
        };
        setLoading(true);
        let res = await createComment(data);
        setLoading(false);
        if (res.success) {
            inputRef?.current?.clear();
            commentRef.current = "";
        } else {
            Alert.alert('Comment', res.msg);
        }
    }

    //-------------------------Main------------------------------------------------------
    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                <PostCard
                    item={post}
                    currentUser={user}
                    router={router}
                    hasShadow={false}
                    showMoreIcon={false}
                />

                {/*comment input  */}
                <View style={{ flexDirection: 'row' }}>
                    <Input
                        style={styles.inputContainer}
                        inputRef={inputRef}
                        placeholder="Nhập vào comment..."
                        onChangeText={(value: string) => commentRef.current = value}
                        placeholderTextColor={theme.colors.textLight}
                        containerStyle={{ flex: 1, height: hp(6.2), borderRadius: '18' }}
                    />
                    {
                        loading ? (
                            <View style={styles.loading}>
                                <Loading size="small"/>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                                <Icon name='send' color={theme.colors.primaryDark} />
                            </TouchableOpacity>
                        )
                    }
                </View>
            </ScrollView >
        </View >
    )
}

export default PostDetails;
//-------------------------CSS------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: wp(7),
    },
    inputContainer: {
        alignItems: 'center',
        gap: 10,
        width: wp(70)

    },
    list: {
        paddingHorizontal: wp(4),
    },
    sendIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        height: hp(5.8),
        width: hp(5.8),
        marginLeft: 10,
        marginTop: 3
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notFound: {
        fontSize: hp(2.5),
        color: theme.colors.text,
        fontWeight: '500',
    },
    loading: {
        height: hp(5.8),
        width: hp(5.8),
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: 1.3 }]
    }
})