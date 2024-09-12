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
//----------------------------------tạo hoặc updâte post--------------------------------------------------------------- 
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

//-------------------------------------------thêm like cho post---------------------------------------------------------------- 
export const createPostLike = async (postLike: any): Promise<CreateOrUpdatePostResponse> => {
    try {
        const { data, error } = await supabase
            .from('postLikes')
            .insert(postLike)
            .select()
            .single();

        if (error) {
            console.log('createPostLike: ', error);
            return { success: false, msg: 'Không thể createPostLike' };
        }
        return { success: true, data };
    } catch (error) {
        console.log('createPostLike: ', error);
        return { success: false, msg: 'Không thể createPostLike' };
    }
};


//---------------------------------------------xóa like post----------------------------------------------------------
export const removePostLike = async (postId: string, userId: string): Promise<CreateOrUpdatePostResponse> => {
    try {
        const { error } = await supabase
            .from('postLikes')
            .delete()
            .eq('userId', userId)
            .eq('postId', postId);  // Chỉnh lại từ 'postOd' thành 'postId'

        if (error) {
            console.log('removePostLike: ', error);
            return { success: false, msg: 'Không thể removePostLike' };
        }
        return { success: true, data: null };  // Trả về thành công
    } catch (error) {
        console.log('removePostLike: ', error);
        return { success: false, msg: 'Không thể removePostLike' };
    }
};

//----------------------------------------truy xuất post-------------------------------------------------------------------------  
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
                ),
                postLikes(*)
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

//---------------------------lấy thông tin chi tiết của bài post---------------------------------
export const fetchPostDetails = async (postId:any) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                user:users (
                    id,
                    name,
                    image
                ),
                postLikes(*)
            `)  // Chú ý dấu ngoặc đơn và cách truy vấn các trường liên quan
            .eq('id',postId)
            .single();

        if (error) {
            console.log('fetchPostDetail error: ', error);
            return { success: false, msg: 'Không thể fetchPostDetail ' };
        }
        return { success: true, data };
    } catch (error) {
        console.log('fetchPostDetail : ', error);
        return { success: false, msg: 'Không thể fetchPostDetail ' };
    }
};
//-----------------------------hàm tạo comment-----------------------------------
export const createComment = async (comment:any)=>{
    try{
        const {data,error} = await supabase
        .from('comments')
        .insert(comment)
        .select()
        .single();

        if(error){
            console.log('comment error: ',error);
            return {success:false, msg:'could not create your comment'};
        }
        return {success:true, data:data};
    }catch(error){
        console.log('comment error: ',error);
        return {success:false, msg:'could not create comment'};
    }
}


