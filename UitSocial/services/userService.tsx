import { supabase } from "@/lib/supabase";

//---------------------------------------------------------------------------------------------------------------
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

//------------------------------------------------------------------------------------------------------
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
//----------------------------------------Tinh nang ket ban------------------------------------------
// Lấy danh sách bạn bè của người dùng
export const getUserFriends = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('friends')
            .select('user_id1, user_id2, status')
            .or(`user_id1.eq.${userId},user_id2.eq.${userId}`);

        if (error) {
            return {
                success: false,
                msg: error.message,
            };
        }

        // In ra danh sách bạn bè
        console.log("Friends data:", data);

        return { success: true, data };
    } catch (error: unknown) {
        if (error instanceof Error) {
            return {
                success: false,
                msg: error.message,
            };
        } else {
            return {
                success: false,
                msg: 'Unknown error occurred',
            };
        }
    }
};

// Lấy danh sách người dùng có thể kết bạn (trừ người dùng hiện tại)
export const getAvailableUsersForFriends = async (userId: string) => {
    try {
        // Lấy tất cả người dùng trừ người dùng hiện tại
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, image')
            .neq('id', userId);

        if (usersError) {
            return {
                success: false,
                msg: usersError.message,
            };
        }

        // Lấy danh sách bạn bè hiện tại
        const friendsResult = await getUserFriends(userId);

        // Kiểm tra nếu xảy ra lỗi khi lấy danh sách bạn bè
        if (!friendsResult.success || !friendsResult.data) {
            return {
                success: false,
                msg: friendsResult.msg || 'Error fetching friends',
            };
        }

        const friends = friendsResult.data;

        // Chuyển đổi dữ liệu bạn bè thành một tập hợp (Set)
        const friendSet = new Set(friends.map(f => (f.user_id1 === userId ? f.user_id2 : f.user_id1)));

        // Lọc những người dùng chưa kết bạn
        const availableUsers = users.filter(user => !friendSet.has(user.id));
        console.log("can connect Friends data:", availableUsers);
        return { success: true, data: availableUsers };
    } catch (error: unknown) {
        if (error instanceof Error) {
            return {
                success: false,
                msg: error.message,
            };
        } else {
            return {
                success: false,
                msg: 'Unknown error occurred',
            };
        }
    }
};

