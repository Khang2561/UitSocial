import { ScrollView, StyleSheet, View, LogBox, TouchableOpacity, Alert, Text } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createComment, fetchPostDetails, removeComment } from "@/services/postService";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";
import Input from "@/components/Input";
import Icon from 'react-native-vector-icons/Feather';
import CommentItem from "@/components/CommentItem";

LogBox.ignoreAllLogs(true);

// Định nghĩa kiểu props cho component PostCard
type PostCardProps = {
    item: any;
    currentUser: any;
    router: any;
    hasShadow?: boolean;
    showMoreIcon?: boolean;
};

// Định nghĩa kiểu props cho component Input
type InputProps = {
    style?: any;
    inputRef?: React.RefObject<any>;
    placeholder?: string;
    onChangeText?: (value: string) => void;
    placeholderTextColor?: string;
    containerStyle?: any;
};

type Comment = {
    id: string;
    text: string;
    user: {
        name: string;
        image: string;
        id: string;
    };
    created_at: string;
};

const PostDetails = () => {
    //-------------------------CONST------------------------------------------------------
    const { postId } = useLocalSearchParams();
    const [post, setPost] = useState<any>(null);
    const { user } = useAuth();
    const router = useRouter();
    const [startLoading, setStartLoading] = useState(true);
    const inputRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);
    const commentRef = useRef<string>('');

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
    };

    const onNewComment = async () => {
        if (!commentRef.current) return null;
        let data = {
            userId: user?.id,
            postId: post?.id,
            text: commentRef.current
        };
        setLoading(true);
        let res = await createComment(data);
        setLoading(false);
        if (res.success) {
            inputRef?.current?.clear();
            commentRef.current = "";
            // Cập nhật lại bài post với comment mới
            getPostDetails();  // Fetch lại chi tiết bài post để lấy comment mới nhất
        } else {
            Alert.alert('Comment', res.msg);
        }
    };

    const onDeleteComment = async (comment: Comment) => {
        console.log('deleting comment: ', comment);
        console.log('deleting comment id: ', comment.id);
        let res = await removeComment(comment.id);
        if (res.success) {
            setPost((prevPost: any) => {
                const updatedComments = prevPost.comments.filter((c: Comment) => c.id !== comment.id);
                return {
                    ...prevPost,
                    comments: updatedComments,
                };
            });
        } else {
            Alert.alert('Comment : ', res.msg);
        }
    };

    //-------------------------Main------------------------------------------------------
    if (startLoading) {
        return (
            <View style={styles.center}>
                <Loading />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={[styles.center, { justifyContent: 'flex-start', marginTop: 100 }]}>
                <Text style={styles.notFound}>Post not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                <PostCard
                    item={{ ...post, commentsCount: post?.comments?.length }}
                    currentUser={user}
                    router={router}
                    hasShadow={false}
                    showMoreIcon={false}
                />

                {/* Comment input */}
                <View style={{ flexDirection: 'row' }}>
                    <Input
                        style={styles.inputContainer}
                        inputRef={inputRef}
                        placeholder="Nhập vào comment..."
                        onChangeText={(value: string) => commentRef.current = value}
                        placeholderTextColor={theme.colors.textLight}
                        containerStyle={{ flex: 1, height: hp(6.2), borderRadius: 18 }}
                    />
                    {
                        loading ? (
                            <View style={styles.loading}>
                                <Loading size="small" />
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                                <Icon name='send' color={theme.colors.primaryDark} />
                            </TouchableOpacity>
                        )
                    }
                </View>

                {/* Comment list */}
                {
                    post?.comments?.map((comment: Comment) => (
                        <CommentItem
                            key={comment.id?.toString()}
                            item={{
                                id: comment.id,  // Truyền id của comment vào đây
                                text: comment.text,
                                user: {
                                    id: comment.user?.id,
                                    name: comment.user?.name,
                                    image: comment.user?.image,
                                },
                                created_at: comment.created_at,
                                canDelete: user.id === comment.user.id || user.id === post?.userId,
                            }}
                            onDelete={onDeleteComment}
                        />
                    ))
                }

                {
                    post?.comments?.length === 0 && (
                        <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
                            Hãy là người comment đầu tiên
                        </Text>
                    )
                }
            </ScrollView>
        </View>
    );
};

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
        height: hp(5.8),
        width: hp(5.8),
        marginLeft: 10,
        marginTop: 3,
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
        transform: [{ scale: 1.3 }],
    },
});
