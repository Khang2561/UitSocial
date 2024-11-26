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
            .select('*')
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
//-----------------------------------------
// Gửi yêu cầu kết bạn
export const sendFriendRequest = async (userId1: string, userId2: string) => {
    try {
        const { error } = await supabase
            .from('friends')
            .insert([{ user_id1: userId1, user_id2: userId2, status: 0, whoSend: userId1 }]); // Thêm whoSend là user gửi yêu cầu

        if (error) {
            return {
                success: false,
                msg: error.message,
            };
        }
        return { success: true };
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

//lấy danh sách người đang gửi yêu cầu kết bạn tới mình 
export const fetchFriendRequests = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('friends')
            .select('user_id1,status,whoSend')
            .eq('user_id2', userId)
            .eq('status', 0)
            .neq('whoSend', userId);  // Loại bỏ yêu cầu do chính user gửi

        if (error) {
            console.error("Error fetching friend requests:", error);
            return { success: false, msg: error.message };
        }

        const userIds = data.map((request) => request.user_id1);

        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .in('id', userIds);

        if (usersError) {
            return { success: false, msg: usersError.message };
        }

        return { success: true, data: users };
    } catch (error: unknown) {
        if (error instanceof Error) {
            return { success: false, msg: error.message };
        } else {
            return { success: false, msg: 'An unknown error occurred' };
        }
    }
};


// Chấp nhận yêu cầu kết bạn
export const acceptFriendRequest = async (userId1: string, userId2: string) => {
    try {
        // Kiểm tra xem yêu cầu kết bạn có tồn tại không
        const { data, error: checkError } = await supabase
            .from('friends')
            .select('*')
            .or(`user_id1.eq.${userId1},user_id2.eq.${userId2},user_id1.eq.${userId2},user_id2.eq.${userId1}`);

        if (checkError) {
            console.log("Check error:", checkError);
            return {
                success: false,
                msg: checkError.message,
            };
        }

        if (data && data.length === 0) {
            return {
                success: false,
                msg: 'Yêu cầu kết bạn không tồn tại',
            };
        }

        // Cập nhật trạng thái của yêu cầu kết bạn (status = 1 biểu thị đã chấp nhận)
        const { error: updateError } = await supabase
            .from('friends')
            .update({ status: 1 }) // 1 biểu thị yêu cầu đã được chấp nhận
            .or(`user_id1.eq.${userId1},user_id2.eq.${userId2},user_id1.eq.${userId2},user_id2.eq.${userId1}`);

        if (updateError) {
            console.log("Update error:", updateError);
            return {
                success: false,
                msg: updateError.message,
            };
        }

        return { success: true };
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

//Hàm từ chối yêu cầu kết bạn 
export const rejectFriendRequest = async (userId1: string, userId2: string) => {
    console.log('userId1:', userId1);
    console.log('userId2:', userId2);

    try {
        // Kiểm tra dữ liệu trước khi xóa
        const { data, error: selectError } = await supabase
            .from('friends')
            .select('*')
            .or(`and(user_id1.eq.${userId1},user_id2.eq.${userId2}),and(user_id1.eq.${userId2},user_id2.eq.${userId1})`);

        console.log('Data trước khi xóa:', data);

        if (selectError) {
            console.error('Lỗi khi kiểm tra dữ liệu:', selectError);
            return {
                success: false,
                msg: selectError.message,
            };
        }

        // Nếu tìm thấy kết quả, tiến hành xóa
        if (data && data.length > 0) {
            const { error: deleteError } = await supabase
                .from('friends')
                .delete()
                .or(`and(user_id1.eq.${userId1},user_id2.eq.${userId2}),and(user_id1.eq.${userId2},user_id2.eq.${userId1})`);

            if (deleteError) {
                console.error('Lỗi khi xóa yêu cầu kết bạn:', deleteError);
                return {
                    success: false,
                    msg: deleteError.message,
                };
            }

            return { success: true };
        } else {
            return {
                success: false,
                msg: 'Không tìm thấy yêu cầu kết bạn để xóa.',
            };
        }
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

//Lấy danh sách bạn bè 
export const getUserFriendsList = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('friends')
            .select(`
                user_id1,
                user_id2,
                status,
                users:user_id1 (
                    id,
                    name,
                    image
                ),
                friend:user_id2 (
                    id,
                    name,
                    image
                )
            `)
            .or(`user_id1.eq.${userId},user_id2.eq.${userId}`);

        if (error) {
            return {
                success: false,
                msg: error.message,
            };
        }

        // Chuyển đổi dữ liệu để chỉ lấy thông tin người bạn
        const friends = data?.map((friend: any) => {
            const isCurrentUser = friend.user_id1 === userId;
            const friendInfo = isCurrentUser ? friend.friend : friend.users;

            return {
                id: friendInfo.id,
                name: friendInfo.name, // Đổi từ username thành name
                avatar_url: friendInfo.image, // Đổi từ avatar_url thành image
                status: friend.status,
            };
        });

        console.log("Processed Friends data:", friends);
        return { success: true, data: friends };
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

//Điền thông tin khoa 
export const fillKhoa = async (
    emailSign: string,
    khoaSign: string,
    id: string
) => {
    try {
        const { error } = await supabase
            .from('users') // Tên bảng
            .update({
                email: emailSign,
                Khoa: khoaSign,
                image: 'profiles/1726640286388.png', // Đường dẫn ảnh mặc định
            })
            .eq('id', id); // Cập nhật theo ID

        if (error) {
            return {
                success: false,
                msg: error.message,
            };
        }
        return { success: true };
    } catch (err) {
        return {
            success: false,
            msg: 'Lỗi không xác định',
        };
    }
};



//-----------------------------------------------
