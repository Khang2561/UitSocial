import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'
import { supabaseUrl } from '../constants/index'
import * as ImagePicker from 'expo-image-picker';

//-------------------------------------------------------------------------------------------------------------------------
export const getUserImageSrc = (imagePath: any | null) => {
    if (imagePath) {
        return getSupabaseFileUrl(imagePath);
    } else {
        return require('../assets/images/UitLogo.jpeg'); // Sửa lại tên file 'defautUser.jpg' thành 'defaultUser.jpg'
    }
};

//-------------------------------------------------------------------------------------------------------------------------------
export const getSupabaseFileUrl = (filePath: any | null) => {
    if (filePath) {
        return `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`;
    }
    return null;
}

//-----------------------------------------Function upload ảnh----------------------------------------------------------------------
export const uploadFile = async (folderName: string, fileUri: string, isImage = true) => {
    try {
        let fileName = getFilePath(folderName, isImage);
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64
        });
        let imageData = decode(fileBase64);
        let { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(fileName, imageData, {
                cacheControl: '3600',
                upsert: false,
                contentType: isImage ? 'image/*' : 'video/*'
            });
        if (error) {
            console.log('file upload error: ', error);
            return { success: false, msg: 'Không thể upload media' };
        }

        console.log('data', data);

        return { success: true, data: data?.path }
    } catch (error) {
        console.log('file upload error: ', error);
        return { success: false, msg: 'Không thể upload media' };
    }
};

//------------------------------------Function lấy link của ảnh--------------------------------------------------------
export const getFilePath = (folderName: string, isImage: boolean) => {
    return `/${folderName}/${(new Date()).getTime()}${isImage ? '.png' : '.mp4'}`;
};

//Function dowload file 
export const dowloadFile = async (url: string) => {
    try {
        const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url));
        return uri;
    } catch (error) {
        return null;
    }
};

//---------------------------------------------------------------------
export const getLocalFilePath = (filePath: string) => {
    let fileName = filePath.split('/').pop();
    return '${FileSystem.documentDirectory}${fileName}';
}

//----------------------NEW POST-------------------
export const isLocalFile = (file: any): file is ImagePicker.ImagePickerAsset => {
    return typeof file === 'object';
};

export const getFileType = (file: any) => {
    if (isLocalFile(file)) {
        return file.type;
    }
    if (file.includes('postImages')) {
        return 'image';
    }
    return 'video';
};

export const getFileUri = (file: ImagePicker.ImagePickerAsset | string | null): string | undefined => {
    if (!file) return undefined;
    if (isLocalFile(file)) {
        return (file as ImagePicker.ImagePickerAsset).uri;//trên điện thoai
    }
    return getSupabaseFileUrl(file as string) || undefined;// trên supubase 
};