import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ChatHeader = ({ user, isTyping, onBack }: any) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    // router.navigate("/chats");
    if (onBack) onBack();
    router.navigate("/(tabs)/home");
  };

  const formatLastSeen = () => {
    if (!user?.lastSeen) return "";

    const date = new Date(user.lastSeen);
    return `Last seen ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const renderStatus = () => {
    if (isTyping) {
      return (
        <Text className="text-xs text-[#25D366] font-medium">Typing...</Text>
      );
    }

    if (user?.isOnline) {
      return <Text className="text-xs text-[#25D366] font-medium">Online</Text>;
    }

    return <Text className="text-xs text-gray-500">{formatLastSeen()}</Text>;
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-white border-b border-gray-200"
    >
      <View className="flex-row items-center px-3 py-3">
        {/* 🔙 Back Button */}
        <Pressable
          onPress={handleBack}
          className="p-2 mr-2 rounded-full active:bg-gray-100"
        >
          <ArrowLeft size={22} color="#111" />
        </Pressable>

        {/* 👤 Avatar */}
        <View className="relative">
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center">
              <Text className="text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}

          {/* 🟢 Online Dot */}
          {user?.isOnline && (
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white" />
          )}
        </View>

        {/* 📛 Name + Status */}
        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-[16px] font-semibold text-gray-900"
          >
            {user?.name}
          </Text>

          {renderStatus()}
        </View>
      </View>

      {/* Subtle Shadow */}
      <View className="h-[0.5px] bg-gray-200" />
    </View>
  );
};

export default ChatHeader;
