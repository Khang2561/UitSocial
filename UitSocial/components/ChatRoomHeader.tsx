import { theme } from "@/constants/theme";
import { useRouter } from "expo-router";
import { TouchableOpacity, View, StyleSheet, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Avatar from '@/components/Avatar';
import { getSupabaseFileUrl } from "@/services/imageService";

interface ChatRoomHeaderProps {
  showBackButton?: boolean;
  user: any; 
}
const ChatRoomHeader = ({ user, showBackButton = true }: ChatRoomHeaderProps) =>  {
    const router = useRouter();
    
    const handleCallPress = () => {
        console.log("Call pressed");
    };

    const handleVideoCallPress = () => {
        console.log("Video call pressed");
    };

    return (
        <View style={styles.container}>
            {showBackButton && (
                <TouchableOpacity onPress={() => router.back()} style={styles.button}>
                    <Icon name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            )}

            <Avatar 
                uri={getSupabaseFileUrl(user?.image) || "https://via.placeholder.com/150"}
                style={styles.avatar}
            />
            <Text style={styles.userName}>{user.name}</Text>

            <View style={styles.iconsContainer}>
                <TouchableOpacity onPress={handleCallPress} style={styles.iconButton}>
                    <Icon name="phone" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleVideoCallPress} style={styles.iconButton}>
                    <Icon name="video" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  button: {
    padding: 10,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  iconsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    right: 10, 
    alignItems: 'center',
  },
  iconButton: {
    padding: 10,
    marginLeft: 10,
  },
});

export default ChatRoomHeader;
