import { StyleSheet,Text,TouchableOpacity,View } from "react-native"
import React from "react"
import { hp } from "@/helpers/common"
import { theme } from "@/constants/theme"
import Avatar from "./Avatar"
import { getSupabaseFileUrl } from "@/services/imageService"
import moment from "moment"

const NotificationItem = ({
    item,
    router,
}:{
    item:any,
    router:any,
}) =>{
    const uri = item?.sender?.image ? getSupabaseFileUrl(item?.sender?.image) : null;
    const createAt = moment(item?.created_at).format('MMM d')

    const handleClick = () =>{
        //open post detail
        let {postId, commentId} = JSON.parse(item?.data); 
        console.log('notification item post id: ',postId)
        console.log('notification item comment id: ',commentId)
        router.push({pathname:'postDetail',params:{postId, commentId}})
    }

    return(
        <TouchableOpacity style={styles.container} onPress={handleClick}>
            <Avatar
                uri={uri}
                size={hp(5)}
            />
            <View style={styles.nameTitle}>
                <Text style={styles.text}>
                    {
                        item?.sender?.name
                    }
                </Text>
                <Text style={[styles.text,{color:theme.colors.textDark}]}>
                    {
                        item?.title
                    }
                </Text>
            </View>

            <Text style = {[styles.text,{color:theme.colors.textLight}]}>
                    {
                        createAt
                    }
            </Text>
        </TouchableOpacity>
    )
}

export default NotificationItem

const styles = StyleSheet.create({
    container:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        gap:12,
        backgroundColor:'white',
        borderWidth:0.5,
        borderColor:theme.colors.darkLight,
        padding:15,
        borderRadius:theme.radius.xxl,
        borderCurve:'continuous'
    },
    nameTitle:{
        flex:1,
        gap:2,
    },
    text:{
        fontSize: hp(1.6),
        fontWeight:'500',
        color:theme.colors.text
    }
})