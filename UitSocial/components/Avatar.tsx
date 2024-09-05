import { StyleSheet, View, StyleProp, ImageStyle } from 'react-native';
import React from 'react';
import { hp } from '../helpers/common';
import { theme } from '../constants/theme';
import { Image } from 'expo-image';

interface AvatarProps {
    uri: string;
    size?: number;
    rounded?: number;
    style?: StyleProp<ImageStyle>;
}

const Avatar: React.FC<AvatarProps> = ({
    uri,
    size = hp(4.5),
    rounded = theme.radius.md,
    style,
}) => {
    return (
        <View>
            <Image
                source={{ uri }}
                transition={100}
                style={[styles.avatar, { height: size, width: size, borderRadius: rounded }, style]} 
            />
        </View>
    );
};

export default Avatar;

const styles = StyleSheet.create({
    avatar: {
        borderCurve: 'continuous',
        borderColor: theme.colors.darkLight,
        borderWidth: 1,
    },
});
