import { StyleSheet, Text, View } from "react-native";
import React from 'react';
import { router } from "expo-router";
import { theme } from "@/constants/theme";
import { hp, wp } from "@/helpers/common";
import Avatar from "./Avatar";
import { getSupabaseFileUrl } from "@/services/imageService";  // Import hàm lấy URI từ Supabase

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
  const userImageUri = item?.user?.image ? getSupabaseFileUrl(item.user.image) : null; // Lấy URI cho ảnh đại diện
  
  return (
    <View style={[style.container, hasShadow && shadowStyles]}>
      <View style={style.header}>
        {/*avatar name time */}
        <View style={style.userInfo}>
            <Avatar
                size={hp(4.5)}
                uri={userImageUri}  // Đưa URI vào Avatar
                rounded={theme.radius.md} 
            />
            <View style={{gap:2}}>
              <Text style={style.username}>{item?.user?.name}</Text>
              <Text style={style.postTime}>{item?.created_at}</Text>
            </View>
        </View>
      </View>
      <Text>Post Content</Text>
    </View>
  );
};

export default PostCard;

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
