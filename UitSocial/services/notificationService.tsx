import { supabase } from "@/lib/supabase"
//--------------------------gửi thông báo ----------------------------------
export const createNotification = async (notification:any)=>{
    try{
        const {data, error} = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

        if(error){
            console.log('notification error: ',error);
            return {success:false, msg:'Something went wrong!'};
        }

        return {success:true, data:true};
    }catch(error){
        console.log('notification error: ',error);
        return {success:false, msg:'Something went wrong!'};
    }
}

//--------------------------lấy thông báo ----------------------------------
export const fetchNotifications = async (receiverId:any) =>{
    try{
        const {data,error} = await supabase
        .from('notifications')
        .select('*,sender:senderId(id, name,image)')
        .eq('receiverId', receiverId)
        .order("created_at",{ascending:false});

        if(error){
            console.log('fetchNotifications error: ',error);
            return {success:false, msg:'Could not fetch notifications'};
        }

        return {success:true,data:data}
    }catch(error){
        console.log('fetchNotifications error: ',error);
            return {success:false, msg:'Could not fetch notifications'};
    }
}