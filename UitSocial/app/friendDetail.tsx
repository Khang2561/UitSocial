import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';

import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';

type FriendProfileRouteProp = RouteProp<RootStackParamList, 'friendDetail'>;

export type RootStackParamList = {
    friendDetail: { friend: { name: string; image: string } }; // Thay đổi theo kiểu dữ liệu thực tế của bạn
    // Các màn hình khác
};

const FriendProfile = () => {
    const route = useRoute<FriendProfileRouteProp>();
    const { friend } = route.params;

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                {/* Hiển thị ảnh đại diện của bạn bè */}
            </View>
            <Text style={styles.userName}>Tên bạn bè: {friend?.name}</Text>
            {/* Hiển thị thêm thông tin bạn bè khác */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    avatarContainer: {
        height: hp(12),
        width: hp(12),
        alignSelf: 'center',
        borderRadius: hp(6),
        backgroundColor: '#ddd',
        marginBottom: hp(2),
    },
    userName: {
        fontSize: hp(3),
        fontWeight: '600',
        color: theme.colors.textDark,
        textAlign: 'center',
    },
    // Thêm các style khác nếu cần
});

export default FriendProfile;
