import { StyleSheet, Text, View, TextInput, Pressable } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";

const Input = (props: any) => {
    return (
        <View style={[styles.container, props.containerStyles && props.containerStyles]}>
            {/* Hiển thị icon bên trái nếu có */}
            {props.icon && <View style={styles.iconContainer}>{props.icon}</View>}

            {/* TextInput */}
            <TextInput
                style={[styles.input, props.inputStyle]}
                placeholder={props.placeholder}
                placeholderTextColor={theme.colors.textLight}
                ref={props.inputRef}
                secureTextEntry={props.secureTextEntry}
                {...props}
            />

            {/* Hiển thị rightIcon nếu có */}
            {props.rightIcon && (
                <Pressable onPress={props.onRightIconPress} style={styles.rightIconContainer}>
                    {props.rightIcon}
                </Pressable>
            )}
        </View>
    );
};

export default Input;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: hp(7.2),
        alignItems: "center",
        justifyContent: "flex-start",
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.xxl,
        paddingHorizontal: wp(4.5),
        gap: 12,
    },
    iconContainer: {
        marginRight: wp(2), // Khoảng cách giữa icon và TextInput
    },
    input: {
        flex: 1,
        fontSize: hp(2), // Cỡ chữ tùy chỉnh
    },
    rightIconContainer: {
        position: "absolute",
        right: wp(4), // Khoảng cách bên phải
        top: "50%",
        transform: [{ translateY: -12 }], // Căn giữa icon theo chiều dọc
    },
});
