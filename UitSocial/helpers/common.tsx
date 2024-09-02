import { Dimensions } from "react-native";
//Lấy chiều cao và chiều rộng của của mạng hình mặt định 
const {width:deviceWidth, height:deviceHeight}=Dimensions.get('window');

export const hp = (percentage: number) =>{
    return(percentage*deviceHeight) / 100;
}

export const wp = (percentage: number) =>{
    return(percentage*deviceWidth) / 100;
}
