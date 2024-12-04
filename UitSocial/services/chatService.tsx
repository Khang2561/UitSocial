import { supabase } from "@/lib/supabase";
import { getFilePath } from "./imageService";
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'

// Type definition for generic API response
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  msg?: string;
}

// Utility function to handle Supabase errors
const handleSupabaseError = (error: any, defaultMessage: string): ApiResponse => ({
  success: false,
  msg: error instanceof Error ? error.message : defaultMessage,
});

// Fetch available users excluding the current user (CHỈ LẤY BẠN BÈ)
export const getAvailableUsers = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select()
      .neq('id', userId);

    if (error) return handleSupabaseError(error, "Failed to fetch users");

    return { success: true, data };
  } catch (error) {
    return handleSupabaseError(error, "Unknown error occurred");
  }
}

// Create a chat room between two users
export const createChatRoom = async (userId1: string, userId2: any): Promise<ApiResponse> => {
  const roomId = await getRoomId(userId1, userId2);

  try {
    const { data: existingRoom, error: roomFetchError } = await supabase
      .from('rooms')
      .select('*')
      .eq('roomId', roomId)
      .single();

    if (roomFetchError && roomFetchError.code !== 'PGRST116') {
      throw new Error(`Error checking existing chat room: ${roomFetchError.message}`);
    }

    // If room exists, return it
    if (existingRoom) return { success: true, data: existingRoom };

    // Create a new room if none exists
    const { data: newRoom, error: createError } = await supabase
      .from('rooms')
      .insert([{ roomId }])
      .select();

    if (createError) throw new Error(`Error creating chat room: ${createError.message}`);

    return { success: true, data: newRoom };
  } catch (error) {
    return handleSupabaseError(error, "Failed to create chat room");
  }
}

// Generate a consistent room ID for two users
export const getRoomId = async (userId1: string, userId2: any): Promise<string> => {
  const [sortedId1, sortedId2] = [userId1, userId2].sort();
  const halfUserId1 = sortedId1.slice(0, sortedId1.length / 2);
  const halfUserId2 = sortedId2.slice(0, sortedId2.length / 2);

  return `${halfUserId1}-${halfUserId2}`;
}

// Send a message in a chat room (đã cập nhập thêm hình ảnh vào)
/*export const sendMessage = async (userId: string, roomId: string, message: string): Promise<ApiResponse> => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                text: message,
                senderId: userId,
                roomId,
            }])
            .select();

        if (error) throw new Error(`Error sending message: ${error.message}`);

        return { success: true, data };
    } catch (error) {
        return handleSupabaseError(error, "Failed to send message");
    }
}*/

export const sendMessage = async (
  userId: string,
  roomId: string,
  message: string,
  fileUrl?: string, // Optional file URL
): Promise<ApiResponse> => {
  try {
    const messageData: any = {
      text: message,
      senderId: userId,
      roomId,
    };

    if (fileUrl) {
      messageData.file = fileUrl; // Include file URL if provided
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select();

    if (error) throw new Error(`Error sending message: ${error.message}`);

    return { success: true, data };
  } catch (error) {
    return handleSupabaseError(error, "Failed to send message");
  }
};

// Fetch messages from a chat room
export const fetchMessages = async (
  roomId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('roomId', roomId)
      .order('created_at', { ascending: false }) // Order by latest messages first
      .range(offset, offset + limit - 1); // Use range for offset-based pagination

    if (error) throw new Error(`Error fetching messages: ${error.message}`);

    return { success: true, data };
  } catch (error) {
    return handleSupabaseError(error, "Failed to fetch messages");
  }
};

//LẤY TIN NHẮN MỚI NHẤT VÀ THỜI GIAN 
export const fetchChatRooms = async (roomId: string) => {
  try {
    // Lấy chỉ tin nhắn mới nhất từ phòng chat
    const { data, error } = await supabase
      .from('rooms')
      .select(`roomId, messages (text, created_at)`)
      .eq('roomId', roomId)
      .order('created_at', { ascending: true })  // Sắp xếp theo thời gian giảm dần
      .limit(1);  // Lấy chỉ 1 tin nhắn mới nhất

    // Kiểm tra lỗi nếu có
    if (error) throw error;

    // Xử lý dữ liệu và trả về kết quả
    return {
      success: true,
      data: data.map(room => ({
        ...room,
        latest_message: room.messages?.[0]?.text || 'No messages yet',
        time: room.messages?.[0]?.created_at || 'N/A'
      }))
    };
  } catch (error) {
    console.error('Error fetching chat rooms:', error);  // Log chi tiết lỗi
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
};

export const fetchLatestMessageTime = async (roomId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('created_at')
      .eq('roomId', roomId)  // Sửa thành 'roomId' nếu đó là tên đúng
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    return data ? data[0]?.created_at : null;
  } catch (error) {
    console.error("Error fetching latest message time:", error);
    return null;
  }
};

//đưa ảnh và video từ trong phòng chat lên supbase 

export const uploadChatMedia = async (folderName: string, fileUri: string, isImage = true) => {
    try {
      // Đặt tên file và đọc nội dung file dưới dạng base64
      const fileName = `${folderName}/${Date.now()}-${fileUri.split('/').pop()}`;
      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imageData = decode(fileBase64);
  
      // Upload file lên Supabase
      const { data, error } = await supabase.storage.from("uploads").upload(fileName, imageData, {
        cacheControl: "3600",
        upsert: false,
        contentType: isImage ? "image/*" : "video/*",
      });
  
      if (error) {
        console.log("File upload error: ", error);
        return { success: false, msg: "Không thể upload media" };
      }
  
      return { success: true, data: data?.path };
    } catch (error) {
      console.log("File upload error: ", error);
      return { success: false, msg: "Không thể upload media" };
    }
  };


  export const uploadAudio = async (folderName: string, fileUri: string) => {
    try {
      // Tạo tên file độc nhất
      const fileName = `${folderName}/${Date.now()}-${fileUri.split('/').pop()}`;
      
      // Đọc file và chuyển thành base64
      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Tải lên file âm thanh vào Supabase
      const { data, error } = await supabase.storage.from("uploads").upload(fileName, fileBase64, {
        cacheControl: "3600",
        upsert: false,
        contentType: "audio/m4a", // Thay đổi nếu định dạng khác
      });
  
      if (error) {
        console.error("File upload error: ", error);
        return { success: false, msg: "Không thể upload file âm thanh" };
      }
  
      // Lấy URL công khai của file
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(data?.path);
  
      return {
        success: true,
        data: urlData.publicUrl,
      };
    } catch (error) {
      console.error("Error uploading audio: ", error);
      return { success: false, msg: "Không thể upload file âm thanh" };
    }
  };
  
  
  
  /*export const uploadChatMedia = async (folderName: string, fileUri: string, fileType: 'image' | 'video' | 'audio' = 'image') => {
    try {
      const fileName = `${folderName}/${Date.now()}-${fileUri.split('/').pop()}`;
      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      let contentType = '';
      if (fileType === 'image') {
        contentType = 'image/*';
      } else if (fileType === 'video') {
        contentType = 'video/*';
      } else if (fileType === 'audio') {
        contentType = 'audio/m4a'; // Có thể thay đổi tùy theo định dạng ghi âm (ví dụ: audio/mp3)
      }
  
      const { data, error } = await supabase.storage.from("uploads").upload(fileName, fileBase64, {
        cacheControl: "3600",
        upsert: false,
        contentType: contentType,
      });
  
      if (error) {
        console.error("File upload error: ", error);
        return { success: false, msg: "Không thể upload media" };
      }
  
      return { success: true, data: data?.path };
    } catch (error) {
      console.error("File upload error: ", error);
      return { success: false, msg: "Không thể upload media" };
    }
  };*/