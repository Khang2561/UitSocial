import { supabase } from "@/lib/supabase";

export const getAvailableUsers = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select()
            .neq('id', userId); // Fetch all users except the current user

        if (error) {
            return {
                success: false,
                msg: error.message,
            };
        }

        return { success: true, data };
    } catch (error: unknown) {
        // Check if the error is an instance of Error
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
}

export const createChatRoom = async (userId1: any, userId2: any) => {
    let roomId = await getRoomId(userId1, userId2);
    try {
        // Check if a room between these two users already exists
        const { data: existingRoom, error: roomFetchError } = await supabase
            .from('rooms')
            .select('*')
            .eq('roomId', roomId)
            .single(); // Expect a single result

        if (roomFetchError && roomFetchError.code !== 'PGRST116') {
            throw new Error("Error checking existing chat room: " + roomFetchError.message);
        }

        // If room exists, return it
        if (existingRoom) {
            return { success: true, room: existingRoom };
        }

        // Otherwise, create a new room
        const { data: newRoom, error: createError } = await supabase
            .from('rooms')
            .insert([{ roomId: roomId}])
            .select()
  

        if (createError) {
            throw new Error("Error creating chat room: " + createError.message);
        }

        // Return the newly created room
        return { success: true, room: newRoom };

    } catch (error) {
        console.error("Failed to create chat room:", error);
        return { success: false };
    }
}

export const getRoomId = async (userId1: any, userId2: any) => {
    // Sort the IDs alphabetically to ensure consistent roomId regardless of user order
    const sortedIds = [userId1, userId2].sort();
 
    // Take the first half of each UUID (18 characters)
    const halfUserId1 = sortedIds[0].substring(0, Math.floor(sortedIds[0].length / 2));
    const halfUserId2 = sortedIds[1].substring(0, Math.floor(sortedIds[1].length / 2));
 
    // Join the two halves together to form the roomId
    const roomId = `${halfUserId1}-${halfUserId2}`;
 
    // Return the roomId string directly
    return roomId;
 };

 export const sendMessage = async (userId: any, roomId: any, message: string) => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                text: message,
                senderId: userId,
                roomId: roomId
            }])
            .select(); // Ensure you get the inserted message back

        if (error) {
            throw new Error("Error sending message: " + error.message);
        }

        return { success: true, data };  // Return the message data on success

    } catch (error: unknown) {
        // Check if the error is an instance of Error
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

export const fetchMessages = async (roomId: string) => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('roomId', roomId)
            .order('created_at', { ascending: true });  // Sort by created_at to display in order

        if (error) {
            throw new Error("Error fetching messages: " + error.message);
        }

        return { success: true, data };  // Return the fetched messages

    } catch (error: unknown) {
        // Check if the error is an instance of Error
        if (error instanceof Error) {
            return {
                success: false,
                msg: error.message,
            };
        } else {
            return {
                success: false,
                msg: 'Unknown error occurred while fetching messages',
            };
        }
    }
};


 

