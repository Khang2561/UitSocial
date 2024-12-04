import { ScrollView, StyleSheet, View, LogBox, TouchableOpacity, Alert, Text } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createComment, fetchPostDetails, removeComment, removePost } from "@/services/postService";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";
import Input from "@/components/Input";
import Icon from 'react-native-vector-icons/Feather';
import CommentItem from "@/components/CommentItem";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";
import { createNotification } from "@/services/notificationService";
import Header from "@/components/Header";

LogBox.ignoreAllLogs(true);

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

type Post = {
    id: string;
    userId: string;
    comments: Comment[];
    // Bạn có thể thêm các thuộc tính khác của Post nếu cần
};

const PostDetails = () => {
    //-------------------------CONST------------------------------------------------------
    const { postId, commentId } = useLocalSearchParams();
    const [post, setPost] = useState<any>(null);
    const { user } = useAuth();
    const router = useRouter();
    const [startLoading, setStartLoading] = useState(true);
    const inputRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);
    const commentRef = useRef<string>('');

    //-------------------------Function------------------------------------------------------
    useEffect(() => {
        let commentChannel = supabase
            .channel('comments')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'comments',
                filter: 'postId=eq.${postId}'
            }, handleNewComment)
            .subscribe();
        getPostDetails();
        return () => {
            supabase.removeChannel(commentChannel);
        }
    }, []);

    //reload lại sau khi add comment 
    const handleNewComment = async (payload: any) => {
        if (payload.new) {
            let newComment = { ...payload.new };//thêm comment mới vào array 
            let res = await getUserData(newComment.user.id);  // add lên database 
            newComment.user = res.success ? res.data : {};
            setPost((prevPost: Post | null) => {
                if (prevPost) {
                    return {
                        ...prevPost,
                        comments: [newComment, ...prevPost.comments],
                    };
                }
                return prevPost;
            });
        }
    };

    //show post details 
    const getPostDetails = async () => {
        let res = await fetchPostDetails(postId);
        if (res.success) {
            setPost(res.data);
        }
        setStartLoading(false);
    };

    //add new comment 
    const onNewComment = async () => {
        if (!commentRef.current) return null;//nếu chưa nhập vào công ty nào thì trả về null 
        let data = {
            userId: user?.id,
            postId: post?.id,
            text: commentRef.current
        };
        setLoading(true);
        let res = await createComment(data);//upload lên database 
        setLoading(false);
        if (res.success) {
            //gửi thông báo tới chủ post 
            if (user.id != post.userId) {
                //send notification 
                let notify = {
                    senderId: user.id,
                    receiverId: post.userId,
                    title: 'commented on your post',
                    data: JSON.stringify({
                        postId: post.id,
                        commentId: res?.data?.id
                    })
                }
                createNotification(notify);//truyền lên data
            }
            inputRef?.current?.clear();
            commentRef.current = "";
            // Cập nhật lại bài post với comment mới
            getPostDetails();  // Fetch lại chi tiết bài post để lấy comment mới nhất
        } else {
            Alert.alert('Comment', res.msg);
        }
    };

    //delete comment 
    const onDeleteComment = async (comment: Comment) => {
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

    //delete post 
    const onDeletePost = async (item: any) => {
        // Xóa bài post
        let res = await removePost(post.id);
        if (res.success) {
            // Reload lại trang Home trước khi quay về
            router.replace('/(main)/main');  // Thay vì router.back(), ta sử dụng router.replace
        } else {
            Alert.alert('Post', res.msg);
        }
    };

    //edit post 
    const onEditPost = async (item: any) => {
        router.back();
        router.push({ pathname: '/(main)/newPost', params: { ...item } })
        console.log("data tra ve : ", item)
    }

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
            <Header title="Profile"></Header>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                <PostCard
                    item={{ ...post, commentsCount: post?.comments?.length }}
                    currentUser={user}
                    router={router}
                    hasShadow={false}
                    showMoreIcon={false}
                    showDelete={true}
                    onDelete={onDeletePost}
                    onEdit={onEditPost}
                />

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

                {
                    post?.comments?.map((comment: Comment) => (
                        <CommentItem
                            key={comment.id?.toString()}
                            item={{
                                id: comment.id,
                                text: comment.text,
                                user: {
                                    id: comment.user?.id,
                                    name: comment.user?.name,
                                    image: comment.user?.image,
                                },
                                highlight: comment.id.toString() === commentId?.toString(),
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
