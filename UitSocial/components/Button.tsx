import { Pressable, StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import React from 'react';

// Define an interface for the Button props
interface ButtonProps {
    buttonStyle?: ViewStyle; // Optional prop for custom button styles
    textStyle?: TextStyle; // Optional prop for custom text styles
    title?: string; // Title text for the button
    onPress?: () => void; // Function to call when the button is pressed
    loading?: boolean; // Indicates if loading state is active
    hasShadow?: boolean; // Indicates if the button should have shadow
}

export const Button: React.FC<ButtonProps> = ({
    buttonStyle,
    textStyle,
    title = '',
    onPress = () => {},
    loading = false, 
    hasShadow = true,
}) => {
    const shadowStyle = hasShadow ? styles.shadow : {};

    return (
        <Pressable onPress={onPress} style={[styles.button, buttonStyle, shadowStyle]}>
            {loading ? (
                <Text style={[styles.text, textStyle]}>Loading...</Text> // Show loading text
            ) : (
                <Text style={[styles.text, textStyle]}>{title}</Text> // Show button title
            )}
        </Pressable>
    );
};

// Define styles for the component
const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007BFF', // Button background color
        paddingVertical: 12, // Vertical padding
        paddingHorizontal: 20, // Horizontal padding
        borderRadius: 8, // Rounded corners
        alignItems: 'center', // Center content
        justifyContent: 'center', // Center content vertically
    },
    text: {
        color: 'white', // Text color
        fontSize: 16, // Font size
        fontWeight: 'bold', // Bold text
    },
    shadow: {
        elevation: 5, // Shadow on Android
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Shadow offset
        shadowOpacity: 0.3, // Shadow opacity
        shadowRadius: 4, // Shadow radius
    },
});

export default Button; // Export the Button component
