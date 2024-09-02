import { View, Text, Button } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapprer';

const Index = () => {
    //Khai báo biến 
    const router = useRouter(); //router chuyển trang

    return (
        <ScreenWrapper>
            <Text>Index</Text>
            <Button
                title="Welcome"
                onPress={() => router.push('welcome')}
            />
        </ScreenWrapper>
    );
};

export default Index;
