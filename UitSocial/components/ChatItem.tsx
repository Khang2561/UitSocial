import { hp } from '@/helpers/common';
import { getSupabaseFileUrl } from '@/services/imageService';
import { router} from 'expo-router';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@/components/Avatar';

// Define the prop types for ChatItem
type ChatItemProps = {
    item: {
      id: string;
      name: string;
      image: string;
      time: string;
      latest_message?: string;
    };
};

const ChatItem = ({ item }:ChatItemProps) => {

  const openChatRoom = ()=>{
    router.push({pathname: '/chatRoom', params: item})
  }

  return (
    <TouchableOpacity style={styles.container} onPress={openChatRoom}>
        <Avatar 
             uri={getSupabaseFileUrl(item?.image) || "https://via.placeholder.com/150"}
             style={styles.avatar}
        />
        {/* Name and Latest Message */}
        <View style={styles.textContainer}>
            <Text style={styles.userName}>{item.name}</Text>
            <View style={styles.messageRow}>
              <Text style={styles.latestMessage}>
                {item.latest_message || 'No messages yet'}
              </Text>
              <Text style={styles.time}>{item.time || 'N/A'}</Text>
        </View>
        </View>
    </TouchableOpacity>

  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
  },
  avatar: {
    height: hp(8),
    width: hp(8),
    borderRadius: hp(8) / 2,
    aspectRatio: 1,
    flexShrink: 0,
  },
  textContainer: {
    marginLeft: 10,  
    justifyContent: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  latestMessage: {
    fontSize: 14,
    color: '#666', 
  },
  time: {
    fontSize: 12,
    color: '#aaa',
  },

});

export default ChatItem;