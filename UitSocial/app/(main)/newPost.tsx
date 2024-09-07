import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapprer';
import Header from '@/components/Header';
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import Avatar from '@/components/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseFileUrl } from '../../services/imageService';
import RichTextEditor from '@/components/RichTextEditor';
import { useRouter } from 'expo-router'


const NewPost = () => {

    const { user } = useAuth();
    const bodyRef = useRef("");
    const editorRef = useRef(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);

    // Use getSupabaseFileUrl to get a proper URL for the image
    const uri = user?.image ? getSupabaseFileUrl(user.image) : null;
    return (
        <ScreenWrapper bg="white">
          <View style={styles.container}>
            <Header title="Tạo bài đăng" />
            <ScrollView contentContainerStyle={{ gap: 20 }}>
              {/* Avatar */}
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
    
              {/* RichTextEditor */}
              <View style={styles.textEditor}>
                <RichTextEditor 
                  editorRef={editorRef} 
                  onChange={(body:any) => (bodyRef.current = body)} 
                />
              </View>
            </ScrollView>
          </View>
        </ScreenWrapper>
      );
}

export default NewPost;

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
    avatar: {
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)'
    },
    publicText: {
        fontSize: hp(1.7),
        fontWeight: '500',
        color: theme.colors.textLight,
    },
    textEditor: {
        //marginTop:10,
    },
    media: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        padding: 12,
        paddingHorizontal: 18,
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        borderColor: theme.colors.gray
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
    imageIcon: {
        // backdgroundColor: theme.colors.gray,
        borderRadius: theme.radius.md,
        //padding:6,
    },
    file: {
        height: hp(30),
        width: '100%',
        borderRadius: theme.radius.xl,
        overflow: 'hidden',
        borderCurve: 'continuous'
    },
    video: {

    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        // shadowColor: theme.colors.textLight,
        // shadowOffset: {width:0, height:3},
        // shadowOpacity : 0.6,
        //shadowRadius:8
    }
})