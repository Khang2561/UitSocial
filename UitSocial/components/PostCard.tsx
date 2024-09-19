import { StyleSheet, Text, TouchableOpacity, View, LogBox, Image, Alert, Share, Pressable, Modal, ScrollView, FlatList } from "react-native";
import React, { useEffect, useState } from 'react';
import { theme } from "@/constants/theme";
import { hp, wp } from "@/helpers/common";
import Avatar from "./Avatar";
import { dowloadFile, getSupabaseFileUrl } from "@/services/imageService";
import moment from 'moment'
import Icon from 'react-native-vector-icons/Entypo';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Feather';
import Icon3 from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import RenderHtml from 'react-native-render-html'
import { Video, ResizeMode } from "expo-av";
import { createPostLike, fetchPosts, removePostLike } from "@/services/postService";
import { stripHtmlTags } from '@/helpers/common'
import ScreenWrapper from "./ScreenWrapprer";
import Header from "./Header";
import { getUserData } from "@/services/userService";
import Loading from "./Loading";

LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer', 'Warning: MemoizedTNodeRenderer', 'Warning: TRenderEngineProvider']);
LogBox.ignoreLogs([
  'WARN  You seem to update props of the "TRenderEngineProvider" component in short periods of time',
  'Another warning message you want to ignore',
]);
type Like = {
  userId: string;
  postId: string;
};

type PostLikeResponse = {
  success: boolean;
};
/*
type ShareContent = {
  message: string;
  url?: string; // Make url optional
};*/

const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  showMoreIcon = true,
  showDelete = false,
  onDelete = () => { },
  onEdit = () => { },
}: {
  item: any,
  currentUser: any,
  router: any,
  hasShadow: boolean,
  showMoreIcon: boolean
  showDelete: boolean
  onDelete: (onDeletePost: any) => void;
  onEdit: (onEditPos: any) => void;
}) => {
  //-------------------------CONST------------------------------------------------------
  const [likes, setLikes] = useState<Like[]>([]);//lấy danh sách like 
  const userImageUri = item?.user?.image ? getSupabaseFileUrl(item.user.image) : null;// lấy đường link chính thức từ supabase 
  const CreateAt = moment(item?.created_at).format('yyyy MMM D');// chỉnh ngày tháng 
  const liked = likes.some((like) => like.userId === currentUser?.id);//kiểm tra người dùng đó đã like bài post chưa 
  const data: Like = {
    userId: currentUser?.id,
    postId: item?.id,
  };
  const texttyles = {
    color: theme.colors.dark,
    fontSize: hp(1.75),
  };

  const tagsStyles = {
    div: texttyles,
    p: texttyles,
    ol: texttyles,
    h1: { color: theme.colors.dark },
    h4: { color: theme.colors.dark },
  };

  const [selectedFriend, setSelectedFriend] = useState<any>(null);//lưu thông tin người được chọn 
  const [posts, setPosts] = useState<any[]>([]);//lưu bài post người được chọn
  const [hasMore, setHasMore] = useState(true);
  const [postLimit, setPostLimit] = useState(15);//lấy danh sachs các bài post 
  const [isModalVisible, setIsModalVisible] = useState(false);//hàm để biết được có show model hay không 
  const [selectedFriendInfo, setSelectedFriendInfo] = useState<any>(null);//lưu thông tin người được chọn 

  //-------------------------Function------------------------------------------------------
  useEffect(() => {
    setLikes(item?.postLikes || []);
  }, [item?.postLikes]);

  //function open post detail
  const openPostDetails = () => {
    if (!showMoreIcon) return null;
    router.push({ pathname: 'postDetail', params: { postId: item?.id } });//truyền vào tham số post id cho create post  
  };

  // Function for like
  const onLike = async () => {
    //Kiểm tra người dùng đã like bài post này chưa
    if (liked) {
      //xử lý trạng thái unlike 
      let updatedLikes = likes.filter(like => like.userId != currentUser?.id);//tách like của người dùng 
      setLikes([...updatedLikes]);//cập nhập lại danh sách bài post 
      let res = await removePostLike(item?.id, currentUser?.id);//gọi api cập nhập lên supubase 
      //kiểm tra trạng thái xem đã thành công hay chưa 
      console.log('removed like: ', res);
      if (!res.success) {
        Alert.alert('Post', 'Something went wrong');
      }
    } else {
      //Thêm like của người dùng vào 
      setLikes([...likes, data]);//cập nhập like mới của người dùng vào array 
      const res: PostLikeResponse | null = await createPostLike(data);//đưa lên supubase 
      //kiểm tra lỗi (nếu có)
      console.log('add like: ', res);
      if (!res?.success) {
        Alert.alert('Post', 'Đã có lỗi xảy ra!');
      }
    }
  };

  // Function for share (đang bị looix)
  const onShare = async () => {
    let content = { message: stripHtmlTags(item?.body) };

    if (item?.file) {
      const fileUrl = getSupabaseFileUrl(item.file);  // Lấy URL từ Supabase
      if (fileUrl) {  // Kiểm tra nếu fileUrl không phải là null
        let url = await dowloadFile(fileUrl);
        if (url) {  // Kiểm tra nếu url không phải là null
          //content.url = url;  
        }
      }
    }
    Share.share(content);
  };

  //function delete post 
  const handlePostDelete = async () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bài post này không', [
      {
        text: 'Hủy',
        onPress: () => console.log('model cancel delete post'),
        style: 'cancel'
      },
      {
        text: 'Xóa',
        onPress: () => onDelete(item),//link với post detail 
        style: 'destructive'
      }
    ])
  }

  //lấy các bài post người được chọn 
  const getPosts = async () => {
    if (!hasMore) return;

    const res = await fetchPosts(postLimit, selectedFriend?.userId);
    if (res.success && res.data) {
      if (res.data.length < postLimit) setHasMore(false); // Check if more posts are available
      setPosts(prevPosts => [...prevPosts, ...res.data]);
    } else {
      setPosts([]);
      setHasMore(false);
    }
  }

  //model đóng bài 
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedFriend(null);
  };

  //lấy thông tin người đuọc chọn 
  const getSelectUserInfo = async (userId: any) => {
    console.log('Fetching user info for userId:', userId);
    const res = await getUserData(userId); // Gọi API getUserData

    if (res?.success) {
      console.log('User data fetched successfully:', res.data);
      setSelectedFriendInfo(res.data); // Giả sử `res.data` là nơi chứa thông tin người dùng
    } else {
      console.log('Error fetching user info:', 'Unknown error');
      setSelectedFriendInfo(null); // Đặt null nếu không lấy được thông tin
    }
  };

  //Nhấn vào trang của bạn bè 
  const handleSelectFriend = (friendData: any) => {
    console.log('da luu duoc thong tin nguowi duoc chon : ', friendData);
    console.log('userid : ', friendData?.userId)
    getSelectUserInfo(friendData?.userId);
    setSelectedFriend(friendData);
    setPosts([]);//làm trống danh sách để lưu bài viết mới 
    setHasMore(true);
    setPostLimit(15); // Reset limit when a new friend is selected
    getPosts(); // Fetch posts for the new friend
    setIsModalVisible(true);
  }

  //-------------------------Main------------------------------------------------------
  return (
    <View style={[style.container, hasShadow && shadowStyles]}>
      {/*name, icon, time, edit */}
      <View style={style.header}>
        {/*Thông tin người dùng  */}
        <Pressable onPress={() => handleSelectFriend(item)}>
          <View style={style.userInfo}>
            {/*avatar */}
            <Avatar
              size={hp(4.5)}
              uri={userImageUri}
              rounded={theme.radius.md}
            />
            <View style={{ gap: 2 }}>
              {/*name*/}
              <Text style={style.username}>{item?.user?.name}</Text>
              {/*time post*/}
              <Text style={style.postTime}>{CreateAt}</Text>
            </View>
          </View>
        </Pressable>
        {
          // icon to open edit post detail 
          showMoreIcon && (
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name='dots-three-horizontal' size={hp(2)} color={theme.colors.text} />
            </TouchableOpacity>
          )
        }
        {
          // only show when your post
          showDelete && currentUser.id == item?.userId && (
            <View style={style.actions}>
              {/*edit post when touch will back create post*/}
              <TouchableOpacity onPress={() => onEdit(item)}>
                <Icon3 name="edit" size={hp(2.5)} color={theme.colors.text} />
              </TouchableOpacity>
              {/*delete post */}
              <TouchableOpacity onPress={handlePostDelete}>
                <Icon3 name="delete" size={hp(2.5)} color={theme.colors.rose} />
              </TouchableOpacity>
            </View>
          )
        }
      </View>

      {/*body and media*/}
      <View style={style.content}>
        {/*show text post*/}
        <View style={style.postBody}>
          {item?.body && (
            <RenderHtml
              contentWidth={wp(100)}
              source={{ html: item?.body }}
              tagsStyles={tagsStyles}
            />
          )}
        </View>
        {/*show images post*/}
        {item?.file && item?.file.includes('postImages') && (
          <Image
            source={{ uri: getSupabaseFileUrl(item?.file) || undefined }}
            style={style.postMedia}
            resizeMode='cover'
          />
        )}
        {/*show video post*/}
        {item?.file && item?.file.includes('postVideos') && (
          <Video
            style={[style.postMedia, { height: hp(30) }]}
            source={{ uri: getSupabaseFileUrl(item?.file) || "" }}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            isLooping
          />
        )}
      </View>

      {/*like, share and comment*/}
      <View style={style.footer}>
        {/*like*/}
        <View style={style.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Icon
              name='heart'
              size={28}
              color={liked ? theme.colors.rose : theme.colors.textDark}
            />
          </TouchableOpacity>
          <Text>{likes?.length}</Text>
        </View>
        {/*comment*/}
        <View style={style.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Icon1 name='comment' size={25} color={theme.colors.textDark} />
          </TouchableOpacity>
          <Text>{item?.comments?.[0]?.count || 0}</Text>
          {/*<Text>{item?.comments || 0}</Text>*/}
        </View>
        {/*share*/}
        <View style={style.footerButton}>
          <TouchableOpacity onPress={onShare}>
            <Icon2 name='share' size={25} color={theme.colors.textDark} />
          </TouchableOpacity>
          <Text>0</Text>
        </View>
      </View>
      {/*----------------------------Model show trang có nhân của bạn bè------------------------------------*/}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <ScreenWrapper>
          <ScrollView>
            <View>
              {/*Header */}
              <Header title='Trang bạn bè' showBackButton={false} />
              {selectedFriend && (
                <View style={{ gap: 15 }}>
                  {/*Avatar */}
                  <View style={style.avatarContainer}>
                    <Avatar
                      uri={getSupabaseFileUrl(selectedFriendInfo?.image) || "https://via.placeholder.com/150"}
                      size={hp(12)}
                      rounded={theme.radius.xxl * 1.4}
                    />
                  </View>
                  {/*Tên và khoa*/}
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Text style={style.userNamePR}>{selectedFriendInfo?.name}</Text>
                    <Text style={style.infoText}>Khoa khoa học và kĩ thuật máy tính</Text>
                  </View>
                  {/*Thông tin*/}
                  <View style={{ gap: 10 }}>
                    <View style={style.info}>
                      <Entypo name="email" size={20} color={theme.colors.textLight} />
                      <Text style={style.infoText}>
                        {selectedFriendInfo?.email || 'email@default.com'}
                      </Text>
                    </View>
                    {selectedFriendInfo?.phoneNumber && (
                      <View style={style.info}>
                        <Icon2 name="phone-call" size={20} color={theme.colors.textLight} />
                        <Text style={style.infoText}>
                          {selectedFriendInfo?.phoneNumber || 'xxxxxxxxxxxxxx'}
                        </Text>
                      </View>
                    )}
                    {selectedFriendInfo?.address && (
                      <View style={style.info}>
                        <Entypo name="location" size={20} color={theme.colors.textLight} />
                        <Text style={style.infoText}>
                          {selectedFriendInfo?.address || 'xxxxxxxxxxxxxx'}
                        </Text>
                      </View>
                    )}
                    {selectedFriendInfo?.bio && (
                      <View style={style.info}>
                        <Text style={style.infoText}>
                          {selectedFriendInfo?.bio || 'xxxxxxxxxxxxxx'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
            {/*----------------------Các bài post------------------------------- */}
            <FlatList
              data={posts}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={style.listStyle}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <PostCard
                  item={item}
                  currentUser={selectedFriendInfo}
                  router={router}
                  hasShadow={true}
                />
              )}
              onEndReached={() => {
                getPosts();
              }}
              onEndReachedThreshold={0}
              ListFooterComponent={hasMore ? (
                <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
                  <Loading />
                </View>
              ) : (
                <View style={{ marginVertical: 30 }}>
                  <Text style={style.noPosts}>
                    No more posts
                  </Text>
                </View>
              )}
            />
            {/*----------------------Các bài post------------------------------- */}
          </ScrollView>
        </ScreenWrapper>
      </Modal>
      {/*----------------------------Model show trang có nhân của bạn bè------------------------------------*/}
    </View>
  );
};

export default PostCard;

//-------------------------CSS------------------------------------------------------
const style = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: 'continuous',
    padding: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: '500',
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  content: {
    gap: 10,
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postMedia: {
    height: hp(40),
    width: '100%',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  //--------------------------------------------------------
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userNamePR: {
    fontSize: hp(3),
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: '500',
    color: theme.colors.textLight,
  },
  info: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 10
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(7),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  //-------------------------------------------------
});

const shadowStyles = {
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 1,
};
