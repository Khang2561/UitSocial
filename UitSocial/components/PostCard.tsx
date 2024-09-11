import { StyleSheet, Text, TouchableOpacity, View, LogBox, Image } from "react-native";
import React, { useRef, useState } from 'react';
import { router } from "expo-router";
import { theme } from "@/constants/theme";
import { hp, wp } from "@/helpers/common";
import Avatar from "./Avatar";
import { getSupabaseFileUrl } from "@/services/imageService";  // Import hàm lấy URI từ Supabase
import moment from 'moment'
import Icon from 'react-native-vector-icons/Entypo';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Feather';
import RenderHtml from 'react-native-render-html'
import { Video, ResizeMode } from "expo-av";


LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer', 'Warning: MemoizedTNodeRenderer', 'Warning: TRenderEngineProvider'])
const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
}: {
  item: any,
  currentUser: any,
  router: any,
  hasShadow: boolean
}) => {
  //-------------------------CONST------------------------------------------------------
  const userImageUri = item?.user?.image ? getSupabaseFileUrl(item.user.image) : null; // Lấy URI cho ảnh đại diện
  const CreateAt = moment(item?.created_at).format('yyyy MMM D');
  const liked = false;
  const likes = [];
  const texttyles = {
    color: theme.colors.dark,
    fontSize: hp(1.75),
  };
  const tagsStyles = {
    div: texttyles,
    p: texttyles,
    ol: texttyles,
    h1: {
      color: theme.colors.dark,  // Đổi từ 'Colors' thành 'color'
    },
    h4: {
      color: theme.colors.dark,  // Đổi từ 'Colors' thành 'color'
    },
  };
  //-------------------------Function------------------------------------------------------
  const openPostDetails = () => {

  }
  //-------------------------Main------------------------------------------------------
  return (
    <View style={[style.container, hasShadow && shadowStyles]}>
      <View style={style.header}>
        {/*avatar name time*/}
        <View style={style.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={userImageUri}  // Đưa URI vào Avatar
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={style.username}>{item?.user?.name}</Text>
            <Text style={style.postTime}>{CreateAt}</Text>
          </View>
        </View>
        {/*edit */}
        <TouchableOpacity onPress={openPostDetails}>
          <Icon name='dots-three-horizontal' size={hp(2)} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      {/*post body */}
      <View style={style.content}>
        <View style={style.postBody}>
          {
            item?.body && (
              <RenderHtml
                contentWidth={wp(100)}
                source={{ html: item?.body }}
                tagsStyles={tagsStyles}
              />
            )
          }
        </View>
        {/*Post image */}
        {
          item?.file && item?.file?.includes('postImages') && (
            <Image
              source={{ uri: getSupabaseFileUrl(item?.file) || undefined }}
              style={style.postMedia}
              resizeMode='cover'  // Use 'resizeMode' instead of 'contentFix'
            />
          )
        }
        {/*Post video */}
        {
          item?.file && item?.file?.includes('postVideos') && (
            <Video
              style={[style.postMedia, { height: hp(30) }]}
              source={{ uri: getSupabaseFileUrl(item?.file) || "" }}  
              useNativeControls
              resizeMode={ResizeMode.COVER}  
              isLooping
            />
          )
        }
      </View>
      {/*Like, comment & share */}
      <View style={style.footer}>
        {/*Like */}
        <View style={style.footerButton}>
          <TouchableOpacity>
            <Icon
              name='heart' 
              size={28} 
              color={liked? theme.colors.rose : theme.colors.textDark}
            />
          </TouchableOpacity>
          <Text>
            {
              likes?.length
            }
          </Text>
        </View>
        {/*comment */}
        <View style={style.footerButton}>
          <TouchableOpacity>
            <Icon1
              name='comment' size={25} color={ theme.colors.textDark}
            />
          </TouchableOpacity>
          <Text>
            {
              0
            }
          </Text>
        </View>
        {/*share */}
        <View style={style.footerButton}>
          <TouchableOpacity>
            <Icon2
              name='share' size={25} color={ theme.colors.textDark}
            />
          </TouchableOpacity>
          <Text>
            {
              0
            }
          </Text>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
  postMedia: {
    height: hp(40),
    width: '100%',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous'
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
