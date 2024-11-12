import { supabase } from "@/lib/supabase";

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

// Fetch available users excluding the current user
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

// Send a message in a chat room
export const sendMessage = async (userId: string, roomId: string, message: string): Promise<ApiResponse> => {
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
}

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

