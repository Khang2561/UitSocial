import { StyleSheet, Text, TouchableOpacity, View, LogBox, Image, Alert, Share } from "react-native";
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
import RenderHtml from 'react-native-render-html'
import { Video, ResizeMode } from "expo-av";
import { createPostLike, removePostLike } from "@/services/postService";
import { stripHtmlTags } from '@/helpers/common'

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
  onDelete=()=>{},
  onEdit=()=>{},
}: {
  item: any,
  currentUser: any,
  router: any,
  hasShadow: boolean,
  showMoreIcon: boolean
  showDelete : boolean
  onDelete: (onDeletePost:any) => void;
  onEdit: (onEditPos:any) => void;
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
  const handlePostDelete = async () =>{
    Alert.alert('Xác nhận','Bạn có chắc muốn xóa bài post này không',[
      {
        text:'Hủy',
        onPress:()=>console.log('model cancel delete post'),
        style:'cancel'
      },
      {
        text:'Xóa',
        onPress:()=>onDelete(item),//link với post detail 
        style:'destructive'
      }
    ])
  }


  //-------------------------Main------------------------------------------------------
  return (
    <View style={[style.container, hasShadow && shadowStyles]}>
      {/*name, icon, time, edit */}
      <View style={style.header}>
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
              <TouchableOpacity onPress={()=>onEdit(item)}>
                <Icon3 name="edit" size={hp(2.5)} color={theme.colors.text}/>
              </TouchableOpacity>
              {/*delete post */}
              <TouchableOpacity onPress={handlePostDelete}>
                <Icon3 name="delete" size={hp(2.5)} color={theme.colors.rose}/>
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
  actions:{
    flexDirection:'row',
    alignItems:'center',
    gap:18,
  }
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
