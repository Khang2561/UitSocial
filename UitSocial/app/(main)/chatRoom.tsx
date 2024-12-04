import ChatRoomHeader from "@/components/ChatRoomHeader";
import Input from "@/components/Input";
import MessagesList from "@/components/MessageList";
import ScreenWrapper from "@/components/ScreenWrapprer";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  createChatRoom,
  getRoomId,
  sendMessage,
  fetchMessages,
  uploadChatMedia,
  uploadAudio,
} from "@/services/chatService";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, PermissionsAndroid, Platform, Image, TouchableOpacity, Text } from "react-native";
import { Icon } from "react-native-elements";
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRef } from "react";
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { Audio} from "expo-av";

const ChatRoom = () => {
  //----------------------------------------------------------------------CONST------------------------------------------
  const item = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loadingPrevMessages, setLoadingPrevMessages] = useState(false);
  //hiển thị file ảnh đã chọn 
  const [file, setFile] = useState<ImagePicker.ImagePickerAsset | null>(null);//save image and video 
  //lưu âm thanh 
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<any>(null);
  const [recordingStatus, setRecordingStatus] = useState("idle");

  //--------------------------------------------------------------------FUNCTION-----------------------------------------
  //------------------------LOAD MESS REAL TIME---------------
  useEffect(() => {
    const loadMessages = async () => {
      await createChatRoom(user.id, item.id);// Create chat room if it doesn't exist
      const roomId = await getRoomId(user.id, item.id);// Fetch the roomId after ensuring the chat room is created
      const result = await fetchMessages(roomId);// Fetch existing messages from the room
      if (result.success) setMessages(result.data || []);
      const subscription = supabase// Set up the real-time subscription after roomId is available
        .channel(`messages-room-${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `roomId=eq.${roomId}`,
          },
          (payload: any) => {
            setMessages((prev) => {
              // Only add if the message ID is not already in the list
              return prev.some((msg) => msg.id === payload.new.id)
                ? prev
                : [...prev, payload.new];
            });
          }
        )
        .subscribe();
      return () => {
        subscription.unsubscribe(); // Cleanup the subscription when the component unmounts
      };
    };
    loadMessages();
  }, [item.id, user.id]); // This effect will run whenever item.id or user.id changes

  //cấp quyền nếu thiết bị chưa được cấp quyền trước đó 
  useEffect(() => {
    async function getPermission() {
      try {
        const permission = await Audio.requestPermissionsAsync();
        console.log("Permission Granted: " + permission.granted);
        setAudioPermission(permission.granted);
      } catch (error) {
        console.error("Error requesting permission:", error);
      }
    }
    getPermission();
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  //---------------------------SEND EVENT-----------------------------------
  const handleSendMessage = async () => {
    const messageText = text.trim();
    const roomId = await getRoomId(user.id, item.id);
  
    if (!messageText && !file && !recordedAudio) return; // Nếu không có tin nhắn, file ảnh/video, hoặc file âm thanh thì không gửi
  
    setText(""); // Clear input immediately
    setFile(null); // Xóa file sau khi gửi
  
    let fileUrl = "";
  
    try {
      // Nếu có file ảnh/video, tải lên Supabase và lấy URL
      if (file) {
        const uploadResult = await uploadChatMedia(`chat-media`, file.uri, file.type?.includes('image') ?? true);
        if (uploadResult.success && uploadResult.data) {
          const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(uploadResult.data);
          fileUrl = urlData.publicUrl; // Lấy URL file ảnh/video
        } else {
          console.error("Error uploading file:", uploadResult.msg);
        }
      }
  
      // Nếu có file âm thanh, tải lên Supabase và lấy URL
      if (recordedAudio) {
        const uploadResult = await uploadAudio(`chat-media`, recordedAudio.uri);
        if (uploadResult.success && uploadResult.data) {
          fileUrl = uploadResult.data; // Lấy URL file âm thanh
        } else {
          console.error("Error uploading audio:", uploadResult.msg);
        }
      }
  
      // Gửi tin nhắn với URL của file ảnh/video hoặc âm thanh (nếu có)
      const result = await sendMessage(user.id, roomId, messageText, fileUrl);
      if (result.success && result.data) {
        setMessages((prevMessages) =>
          prevMessages.some((msg) => msg.id === result.data[0].id)
            ? prevMessages // Tránh trùng lặp
            : [result.data[0], ...prevMessages]
        );
      } else {
        console.error(result.msg || "Failed to send the message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  //------------------------------------LOAD PREV MESSAGES---------------------------------
  const handleLoadPrevMessages = async () => {
    if (loadingPrevMessages || !messages || messages.length === 0) return;
    setLoadingPrevMessages(true);
    const roomId = await getRoomId(user.id, item.id);
    const offset = messages.length; // Calculate offset as the current message count
    try {
      const result = await fetchMessages(roomId, 20, offset);
      if (result.success && result.data.length > 0) {
        setMessages((prevMessages) => [...prevMessages, ...result.data]);
      } else if (result.data.length === 0) {
        console.log("No more messages to load");
      }
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setLoadingPrevMessages(false);
    }
  };

  //----------------------------------Hàm chọn ảnh và video trong điện thoại------------------------------
  const selectMedia = async () => {
    const mediaConfig: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Cho phép chọn cả hình ảnh và video
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    };
    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);
    if (!result.canceled && result.assets.length > 0) {
      setFile(result.assets[0]);
    }
  };
  //-------------------------------------Sự kiên khi bấm ghi âm --------------------------------
  async function handleRecordButtonPress() {
    if (recording) {
      const audioUri = await stopRecording();
      if (audioUri) {
        console.log("Saved audio file to", audioUri);
      }
    } else {
      await startRecording();
    }
  }

  // Bắt đầu ghi âm
  async function startRecording() {
    setIsRecording(true);
    if (isRecording || !audioPermission) {
      console.warn("Recording not allowed or already in progress");
      return;
    }
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingStatus("recording");
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  }

  // Dừng ghi âm
  async function stopRecording() {
    setIsRecording(false);
    try {
      if (recordingStatus === "recording" && recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordedAudio({
          uri,
          name: `recording-${Date.now()}.m4a`,
          type: "audio/m4a",
        });
        setRecording(null);
        setRecordingStatus("stopped");
        return uri;
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  }

  //---------------------------------Sử lý sự kiện khi bấm nút máy ảnh------------
  //----------------------------------------MAIN----------------------------------------------------------
  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.container}>
          {/*--------Header--------- */}
          <ChatRoomHeader user={item} />
          {/*--------MessagesList--------- */}
          <View style={{ flex: 1 }}>
            <MessagesList
              messages={messages}
              currentUser={user}
              receiver={item}
              onLoadPrevMessages={handleLoadPrevMessages}
            />
          </View>
          {/*--------MessagesInput--------- */}
          <View style={styles.inputWrapper}>
            <Icon name="settings-voice" size={24} color={theme.colors.text} onPress={handleRecordButtonPress} />
            <Icon name="image" size={24} color={theme.colors.text} onPress={() => selectMedia()} containerStyle={{ marginLeft: 10 }} />

            {/* Hiển thị file đã chọn trong ô nhập chat */}
            {file && (
              <View style={styles.previewContainer}>
                {file.type?.includes('image') ? (
                  <Image source={{ uri: file.uri }} style={styles.previewImage} />
                ) : (
                  <Image source={{ uri: file.uri }} style={styles.previewImage} />
                )}
              </View>
            )}
            <Input
              placeholder="Aa"
              value={text}
              onChangeText={setText}
              containerStyles={styles.input}
            />
            <Icon name="send" size={24} color={theme.colors.text} onPress={handleSendMessage} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

//---------------------------------------CSS-------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    height: 40,
    borderColor: theme.colors.textLight,
    marginHorizontal: 10,
  },
  previewContainer: {
    marginRight: 10,
    borderRadius: 5,
    overflow: 'hidden',
    width: 40, // kích thước của preview container
    height: 40, // kích thước của preview container
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
  },
});

export default ChatRoom;
