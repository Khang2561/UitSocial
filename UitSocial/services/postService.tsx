import { supabase } from "@/lib/supabase";
import { uploadFile } from "./imageService";

interface PostSuccessResponse {
    success: true;
    data: any;
}

interface PostErrorResponse {
    success: false;
    msg: string;
}

type CreateOrUpdatePostResponse = PostSuccessResponse | PostErrorResponse;

export const createOrUpdatePost = async (post: any): Promise<CreateOrUpdatePostResponse> => {
    try {
        // upload image
        if (post.file && typeof post.file == 'object') {
            let isImage = post?.file?.type === 'image';
            let folderName = isImage ? 'postImages' : 'postVideos';
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);

            if (fileResult.success) {
                if (fileResult.data) {
                    post.file = fileResult.data; // Ensure fileResult.data is a string
                } else {
                    return { success: false, msg: 'File upload succeeded but no file data returned' };
                }
            } else {
                return { success: false, msg: fileResult.msg || 'Unknown error' }; // Handle potential missing msg
            }
        }

        const { data, error } = await supabase
            .from('posts')
            .upsert(post)
            .select()
            .single();

        if (error) {
            console.log('createPost: ', error);
            return { success: false, msg: 'Không thể tạo ra bài post 1' };
        }
        return { success: true, data: data };

    } catch (error) {
        console.log('Tạo bài bị lỗi: ', error);
        return { success: false, msg: 'Không thể tạo bài post 2' };
    }
}

export const fetchPosts = async (limit = 10) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                user:users (
                    id,
                    name,
                    image
                )
            `)  // Chú ý dấu ngoặc đơn và cách truy vấn các trường liên quan
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.log('fetchPost error: ', error);
            return { success: false, msg: 'Không thể fetchPosts' };
        }
        return { success: true, data };
    } catch (error) {
        console.log('fetchPosts: ', error);
        return { success: false, msg: 'Không thể fetchPosts' };
    }
};


