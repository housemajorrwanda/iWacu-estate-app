import * as ImagePicker from "expo-image-picker";
import { Image as ImageIcon, Send, X } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

const MessageInput = ({
  replyMessage,
  onCancelReply,
  onSend,
  onPickImage,
}: any) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ImageTosend, setImageToSend] = useState<string | null>(null);
  const [messageToSend, setMessageToSend] = useState<string | null>(null);
  /* -------------------------------------------------- */
  /* 📸 Pick Image */
  /* -------------------------------------------------- */

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setImageToSend(result.assets[0].uri);
    }
  };

  /* -------------------------------------------------- */
  /* 🚀 Send */
  /* -------------------------------------------------- */

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;

    await onSend(message, selectedImage);

    setMessage("");
    setSelectedImage(null);
    onCancelReply?.();
  };

  return (
    <View className="bg-gray-50 px-3 pt-2 pb-3 border border-gray-100">
      {/* Reply Preview */}
      {replyMessage && (
        <View className="bg-gray-100 p-2 rounded-lg mb-2 flex-row justify-between items-center">
          <Text numberOfLines={1} className="flex-1 text-sm">
            Replying to: {replyMessage.text}
          </Text>
          <TouchableOpacity onPress={onCancelReply}>
            <X size={16} />
          </TouchableOpacity>
        </View>
      )}

      {/* Image Preview */}
      {selectedImage && (
        <View className="mb-2 relative">
          <Image
            source={{ uri: selectedImage }}
            className="w-24 h-24 rounded-xl"
          />
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            className="absolute top-1 right-1 bg-black/60 p-1 rounded-full"
          >
            <X size={14} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Row */}
      <View className="flex-row items-center">
        {/* Image Button */}
        <TouchableOpacity onPress={handlePickImage} className="mr-2">
          <ImageIcon size={22} color="#666" />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[15px]"
          multiline
        />

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          className="ml-2 bg-blue-500 p-3 rounded-full"
        >
          <Send size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageInput;
