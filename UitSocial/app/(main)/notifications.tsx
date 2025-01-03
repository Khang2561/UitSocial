import {ScrollView, StyleSheet, Text, View} from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchNotifications } from '@/services/notificationService'
import { useAuth } from '@/contexts/AuthContext'
import { hp, wp } from '@/helpers/common'
import { theme } from '@/constants/theme'
import ScreenWrapper from '@/components/ScreenWrapprer'
import { useRouter } from 'expo-router'
import NotificationItem from '@/components/NotificationItem'
import Header from '@/components/Header'

const Notifications = () => {
    //-------------------------CONST------------------------------------------------------
    const [notifications, setNotifications] = useState<any[]>([]);
    const {user} = useAuth();
    const router = useRouter();
    //-------------------------Function------------------------------------------------------
    useEffect(()=>{
        getNotifications();
    },[])

    const getNotifications = async() =>{
        let res = await fetchNotifications(user.id);
        if(res.success){
            console.log('Thong bao : ',res);
            setNotifications(res.data || []);
        }
    }

    //-------------------------Main------------------------------------------------------
    return(
        <ScreenWrapper>
            <View style={styles.container}>
                <Header title="Thông báo"/>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listStyle}>
                    {
                        notifications.map(item=>{
                            return(
                                <NotificationItem
                                    item={item}
                                    key={item?.id}
                                    router={router}
                                />
                            )
                        })
                    }
                    {
                        notifications.length==0&&(
                            <Text style={styles.noData}>Hiện tại không có thông báo</Text>
                        )
                    }
                </ScrollView>
            </View>
        </ScreenWrapper>
    )
}

export default Notifications;
//-------------------------CSS------------------------------------------------------
const styles = StyleSheet.create({
    container:{
        flex:1,
        paddingHorizontal:wp(4),
    },
    listStyle:{
        paddingVertical:20,
        gap:10
    },
    noData:{
        fontSize:hp(1.8),
        fontWeight:'500',
        color: theme.colors.text,
        textAlign:'center',
    }
})