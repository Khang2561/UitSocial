export const getUserImageSrc = (imagePath:any) => {
    if (imagePath) {
        return { uri: imagePath };
    } else {
        return require('../assets/images/defautUser.jpg');
    }
};
