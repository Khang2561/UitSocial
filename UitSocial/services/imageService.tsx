export const getUserImageSrc = (imagePath:string) => {
    if(imagePath){
        return{uri: imagePath}
    }else{
        return require('../assets/images/defautUser.jpg')
    }
}