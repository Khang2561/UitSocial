import { StyleSheet,Text, View, TextInput } from "react-native"
import React from 'react'
import {theme} from'../constants/theme'
import {hp, wp} from '../helpers/common'

const Input = (props:any) =>{
    return(
        <View style={[styles.container, props.containerStyles&& props.containerStyles]}>
            {
                props.icon && props.icon
            }
            <TextInput
                style={{flex:1}}
                placeholderTextColor={theme.colors.textLight}
                ref = {props.inputRef && props.inputRef}
                {...props}
            />
        </View>
    )
}

export default Input

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        height: hp(7.2),
        alignItems: 'center', // Sử dụng alignItems thay vì alignContent
        justifyContent: 'flex-start', // Giữ các phần tử ở đầu
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.xxl,
        paddingHorizontal: wp(4.5), // Sử dụng hàm wp cho padding
        gap: 12,
    }
})