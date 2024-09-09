import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Pressable, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapprer';
import Header from '@/components/Header';
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import Avatar from '@/components/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseFileUrl } from '../../services/imageService';
import RichTextEditor from '@/components/RichTextEditor';
import { useRouter } from 'expo-router'
import Icon1 from 'react-native-vector-icons/Feather';
import Button from '@/components/Button'
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av'
import { createOrUpdatePost } from '@/services/postService';
import { RichEditor } from 'react-native-pell-rich-editor';

const NewPost = () => {
  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef<RichEditor | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const uri = user?.image ? getSupabaseFileUrl(user.image) : null;

  const onPick = async (isImage: boolean) => {
    let mediaConfig: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    };
    if (!isImage) {
      mediaConfig = {
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
      };
    }

    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    if (!result.canceled && result.assets.length > 0) {
      setFile(result.assets[0]);
    }
  };

  const isLocalFile = (file: any) => {
    return typeof file === 'object';
  };

  const getFileType = (file: any) => {
    if (isLocalFile(file)) {
      return file.type;
    }

    if (file.includes('postImages')) {
      return 'image';
    }

    return 'video';
  };

  const getFileUri = (file: ImagePicker.ImagePickerAsset | string | null): string | undefined => {
    if (!file) return undefined;
    if (isLocalFile(file)) {
      return (file as ImagePicker.ImagePickerAsset).uri;
    }
    return getSupabaseFileUrl(file as string) || undefined;
  };

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert('Post', "Vui lòng thêm ảnh hoặc nội dung post");
      return;
    }
  
    let data = {
      file,
      body: bodyRef.current,
      userId: user?.id,
    };
  
    setLoading(true);
    const res = await createOrUpdatePost(data);
    setLoading(false);
    if (res.success) {
      setFile(null);
      bodyRef.current = '';
      if (editorRef.current) {
        editorRef.current.setContentHTML('');
      }
      router.back();
    } else {
      Alert.alert('Post', res.msg);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Tạo bài đăng" />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          <View style={styles.header}>
            <Avatar
              uri={uri}
              size={hp(6.5)}
              rounded={theme.radius.xl}
            />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>
                {user && user.name}
              </Text>
              <Text style={styles.publicText}>public</Text>
            </View>
          </View>

          <View style={styles.textEditor}>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body: string) => (bodyRef.current = body)}
            />
          </View>

          {
            file && (
              <View style={styles.file}>
                {
                  getFileType(file) === 'video' ? (
                    <Video
                      style={{ flex: 1 }}
                      source={{
                        uri: getFileUri(file) || '',
                      }}
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
                  )
                }

                <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                  <Icon1 name="delete" size={20} color="white" />
                </Pressable>
              </View>
            )
          }

          <View style={styles.media}>
            <Text style={styles.addImageText}>
              Thêm bài viết
            </Text>
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
          title="Post"
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  );
}

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
    backgroundColor: 'rgba(255,0,0,0.6)'
  }
});

export default NewPost;
