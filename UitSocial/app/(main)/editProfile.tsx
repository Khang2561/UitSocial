import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from 'react';
import ScreenWrapper from "@/components/ScreenWrapprer";
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import Icon from 'react-native-vector-icons/EvilIcons';
import Input from "@/components/Input";
import { User } from "../../entity/User";
import Icon2 from 'react-native-vector-icons/Feather';
import Icon3 from 'react-native-vector-icons/Entypo';
import Button from "@/components/Button";
import { updateUser } from "@/services/userService";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { getUserImageSrc, uploadFile } from "@/services/imageService";
import { getSupabaseFileUrl } from '../../services/imageService';

const EditProfile = () => {
    //-------------------------CONST------------------------------------------------------
    const { user: currentUser, setUserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [user, setUser] = useState<User>({
        id: currentUser?.id || '',
        phoneNumber: currentUser?.phoneNumber || '',
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        image: currentUser?.image || '',
        address: currentUser?.address || '',
        bio: currentUser?.bio || '',
    });

    //-------------------------Function------------------------------------------------------
    useEffect(() => {
        if (currentUser) {
            setUser({
                id: currentUser.id || '',
                name: currentUser.name || '',
                phoneNumber: currentUser.phoneNumber || '',
                email: currentUser.email || '',
                image: currentUser.image || '',
                address: currentUser.address || '',
                bio: currentUser.bio || '',
            });
        }
    }, [currentUser]);
    //hàm chọn ảnh
    const onPickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setUser({ ...user, image: result.assets[0].uri });
        }
    };
    //sử lý sự kiện summit
    const onSubmit = async () => {
        let userData = { ...user };
        let { name, phoneNumber, address, image, bio } = userData;
        if (!name || !phoneNumber || !address || !bio || !image) {
            Alert.alert('Profile', "Vui lòng điền đầy đủ thông tin");
            return;
        }
        setLoading(true);
        if (typeof image === 'string') {
            // Upload to image
            let imageRes = await uploadFile('profiles', image, true);
            if (imageRes.success) {
                userData.image = imageRes.data;
            } else {
                userData.image = null;
            }
        }
        // Update user
        const res = await updateUser(currentUser?.id, userData);
        setLoading(false);
        if (res.success) {
            setUserData({ ...currentUser, ...userData });
            router.back();
        }
    };

    //sử lí chọn hình mới 
    let imageSource;
    if (user.image && user.image.startsWith('file')) {
        // Nếu là đường dẫn cục bộ, sử dụng trực tiếp URI
        imageSource = { uri: user.image };
    } else if (user.image) {
        // Nếu không phải là đường dẫn cục bộ, lấy URL từ Supabase
        imageSource = { uri: getSupabaseFileUrl(user.image) };
    } else {
        // Sử dụng hình ảnh mặc định nếu không có
        imageSource = getUserImageSrc(user.image);
    }
    console.log("HIne thi o edit : ", getSupabaseFileUrl(imageSource));

    //-------------------------Main------------------------------------------------------
    return (
        <ScreenWrapper bg="white">
            <View style={style.container}>
                <ScrollView style={{ flex: 1 }}>
                    <Header title="Edit Profile" />
                    <View style={style.form}>
                        <View style={style.avatarContainer}>
                            <Image source={imageSource} style={style.avatar} />
                            <Pressable style={style.cameraIcon} onPress={onPickImage}>
                                <Icon name="camera" size={20} />
                            </Pressable>
                        </View>
                        <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
                            Vui lòng điền thông tin dưới đây
                        </Text>
                        <Input
                            icon={<Icon name="user" size={40} />}
                            placeholder="Nhập vào tên của bạn"
                            value={user.name}
                            onChangeText={(value: string) => setUser({ ...user, name: value })}
                        />
                        <Input
                            icon={<Icon2 name="phone-call" size={25} />}
                            placeholder="Nhập vào số điện thoại của bạn"
                            value={user.phoneNumber}
                            onChangeText={(value: string) => setUser({ ...user, phoneNumber: value })}
                        />
                        <Input
                            icon={<Icon3 name="location" size={25} />}
                            placeholder="Nhập vào địa chỉ"
                            value={user.address}
                            onChangeText={(value: string) => setUser({ ...user, address: value })}
                        />
                        <Input
                            placeholder="Nhập vào bio"
                            value={user.bio}
                            multiline={true}
                            containerStyles={style.bio}
                            onChangeText={(value: string) => setUser({ ...user, bio: value })}
                        />
                        <Button title="Cập nhật" loading={loading} onPress={onSubmit} />
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

export default EditProfile;
//-------------------------CSS------------------------------------------------------
const style = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(4)
    },
    avatarContainer: {
        height: hp(14),
        width: hp(14),
        alignSelf: 'center'
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: theme.radius.xxl * 1.8,
        borderWidth: 1,
        borderColor: theme.colors.darkLight
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: -10,
        padding: 8,
        borderRadius: 50,
        backgroundColor: 'white',
        shadowColor: theme.colors.textLight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 7
    },
    form: {
        gap: 18,
        marginTop: 20,
    },
    input: {
        flexDirection: 'row',
        borderWidth: 0.4,
        borderColor: theme.colors.text,
    },
    bio: {
        flexDirection: 'row',
        height: hp(15),
        alignItems: 'flex-start',
        paddingVertical: 15
    }
});
