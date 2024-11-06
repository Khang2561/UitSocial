import { View, ViewStyle } from 'react-native';
import React, { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
    children: ReactNode;
    bg?: string;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, bg }) => {
    const insets = useSafeAreaInsets();  
    const paddingTop = insets.top > 0 ? insets.top + 1 : 30;

    const containerStyle: ViewStyle = {
        flex: 1,
        paddingTop:22,
        backgroundColor: bg || 'white',
    };

    return (
        <View style={containerStyle}>
            {children}
        </View>
    );
};

export default ScreenWrapper;
