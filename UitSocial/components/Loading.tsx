import { theme } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

// Định nghĩa interface cho props
interface LoadingProps {
    size?: "small" | "large"; // Kích thước của ActivityIndicator
    color?: string; // Màu sắc của ActivityIndicator
}

export const Loading: React.FC<LoadingProps> = ({
    size = "large", // Giá trị mặc định cho kích thước
    color = theme.colors.primary, // Giá trị mặc định cho màu sắc
}) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
};

// Định nghĩa các kiểu dáng (styles) cho component
const styles = StyleSheet.create({
    container: {
        flex: 1, // Chiếm toàn bộ không gian
        justifyContent: "center", // Căn giữa theo chiều dọc
        alignItems: "center", // Căn giữa theo chiều ngang
    },
});

export default Loading; // Xuất component
