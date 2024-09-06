import { supabase } from "@/lib/supabase";

export const getUserData = async (userId: any) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select()
            .eq('id', userId)
            .single();

        if (error) {
            return {
                success: false,
                msg: error.message,
            };
        }

        return { success: true, data };
    } catch (error: unknown) {
        // Kiểm tra xem error có phải là instance của Error không
        if (error instanceof Error) {
            return {
                success: false,
                msg: error.message,
            };
        } else {
            // Nếu không phải Error, trả về thông báo lỗi mặc định
            return {
                success: false,
                msg: 'Unknown error occurred',
            };
        }
    }
};

export const updateUser = async (userId: string, data:any) => {
    try {
        const { error } = await supabase
            .from('users')
            .update(data)
            .eq('id',userId);

        if (error) {
            return {
                success: false,
                msg: error.message,
            };
        }

        return { success: true, data };
    } catch (error: unknown) {
        // Kiểm tra xem error có phải là instance của Error không
        if (error instanceof Error) {
            return {
                success: false,
                msg: error.message,
            };
        } else {
            // Nếu không phải Error, trả về thông báo lỗi mặc định
            return {
                success: false,
                msg: 'Unknown error occurred',
            };
        }
    }
};
