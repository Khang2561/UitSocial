import { View, Text, Button } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapprer';
import Loading from '@/components/Loading';

const Index = () => {
    //Khai báo biến 
    const router = useRouter(); //router chuyển trang

    return (
        <View style={{flex:1, alignContent:'center',justifyContent:'center'}}>
            <Loading/>
        </View>
    );
};

export default Index;
