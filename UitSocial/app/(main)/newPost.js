import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Pressable, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapprer';
import Header from '@/components/Header';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import RichTextEditor from '@/components/RichTextEditor';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon1 from 'react-native-vector-icons/Feather';
import Button from '@/components/Button';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { createOrUpdatePost } from '@/services/postService';
import { RichEditor } from 'react-native-pell-rich-editor';
import { getSupabaseFileUrl, getFileUri, isLocalFile, getFileType } from '../../services/imageService';

const NewPost = () => {
  //---------------------------------------CONST-----------------------------------------------
  const post = useLocalSearchParams();
  const { user } = useAuth();
  const bodyRef = useRef('');
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const uri = user?.image ? getSupabaseFileUrl(user.image) : null;
  const [isPostUpdated, setIsPostUpdated] = useState(false);
  const [Catagory, setCatagory] = useState('');

  //---------------------------------FUNCTION---------------------------------------------------
  //UseEffect
  useEffect(() => {
    if (post && post.id && !isPostUpdated) {
      const bodyContent = typeof post.body === 'string' ? post.body : Array.isArray(post.body) ? post.body.join('') : '';
      bodyRef.current = bodyContent;
      if (typeof post.file === 'string') {
        setFile({
          uri: getFileUri(post.file) || '',
          type: 'image',
          width: 0,
          height: 0,
          fileSize: 0,
          fileName: '',
          duration: 0,
          assetId: '',
        });
      } else {
        setFile(null);
      }
      setTimeout(() => {
        editorRef.current?.setContentHTML(bodyContent);
      }, 3);
      setIsPostUpdated(true);
    }
  }, [post, isPostUpdated]);

  //Hàm chọn ảnh 
  const onPick = async (isImage) => {
    let mediaConfig = {
      mediaTypes: isImage ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: isImage ? [4, 3] : undefined,
      quality: isImage ? 0.7 : undefined,
    };

    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);
    if (!result.canceled && result.assets.length > 0) {
      setFile(result.assets[0]);
    }
  };

  //Hàm đăng ảnh 
  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert('Post', "Vui lòng thêm ảnh hoặc nội dung post");
      return;
    }
    if (!Catagory) {
      Alert.alert('Post', 'Vui lòng chọn danh mục cho bài viết');
      return;
    }
    let data = {
      file,
      body: bodyRef.current,
      userId: user?.id,
      Catagory,
    };

    if (post.id) {
      data.id = post.id;
    }
    setLoading(true);
    const res = await createOrUpdatePost(data);
    setLoading(false);
    if (res.success) {
      setFile(null);
      bodyRef.current = '';
      editorRef.current?.setContentHTML('');
      router.replace('/main');
    } else {
      Alert.alert('Post', res.msg);
    }
  };

  //--------------------------------------------MAIN-------------------------------------------
  return (
    <ScreenWrapper bg="white">
      {/*
    
     */}
      <View style={styles.container}>
        <Header title="Tạo bài đăng" />


        <ScrollView contentContainerStyle={{ gap: 20 }}>
          <View style={styles.header}>
            <Avatar uri={uri} size={hp(6.5)} rounded={theme.radius.xl} />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>{user?.name}</Text>
              <Text style={styles.publicText}>public</Text>
            </View>
          </View>

          <View style={styles.textEditor}>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body) => (bodyRef.current = body)} />
          </View>

          {file && (
            <View style={styles.file}>
              {getFileType(file) === 'video' ? (
                <Video
                  style={{ flex: 1 }}
                  source={{ uri: getFileUri(file) || '' }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file) || undefined }}
                  resizeMode="cover"
                  style={{ flex: 1 }}
                />
              )}
              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Icon1 name="delete" size={20} color="white" />
              </Pressable>
            </View>
          )}

          <View style={styles.catagorySection}>
            <Text style={styles.catagoryTitle}>Chọn danh mục</Text>
            <View style={styles.catagoryOptions}>
              {['Góc thắc mắc học tập', 'Fix bug', 'Đời sống UIT', 'Tuyển dụng'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catagoryOption, Catagory === cat && styles.catagorySelected]}
                  onPress={() => setCatagory(cat)}
                >
                  <Text
                    style={[styles.catagoryText, Catagory === cat && styles.catagoryTextSelected]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.media}>
            <Text style={styles.addImageText}>Thêm bài viết</Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Icon1 name="image" size={25} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <Icon1 name="video" size={25} color={theme.colors.dark} />
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>

        <Button
          buttonStyle={{ height: hp(6.2) }}
          title={post && post.id ? "Cập nhật" : "Post"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  );
};

//--------------------------------------CSS------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: theme.colors.text,
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: '500',
    color: theme.colors.textLight,
  },
  textEditor: {},
  media: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: '600',
    color: theme.colors.text,
  },
  image: {
    height: hp(30),
    width: '100%',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  video: {
    height: hp(30),
    width: '100%',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  file: {
    height: hp(30),
    width: '100%',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'rgba(255,0,0,0.6)',
  },
  //-------------------------------------
  catagorySection: {
    marginVertical: 20,
  },
  catagoryTitle: {
    fontSize: hp(2),
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 10,
  },
  catagoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catagoryOption: {
    padding: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  catagorySelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  catagoryText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  catagoryTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NewPost;
