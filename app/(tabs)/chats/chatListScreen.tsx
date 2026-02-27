import { db } from "@/app/config/firebase";
import { height } from "@/components/global";
import { useGetProfileQuery } from "@/redux/Slice/userSlice";

// import { db } from "@/src/config/firebase";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { Search } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ================= TYPES ================= */

interface Participant {
  id: string;
  name: string;
  phone: string;
}

interface ChatType {
  id: string;
  participantsIds: string[];
  participants: Participant[];
  lastMessage?: string;
  unreadCount?: { [key: string]: number };
  lastMessageTimestamp?: any;
}

/* ================= CONSTANTS ================= */

const HEADER_MAX_HEIGHT = height * 0.09;
const HEADER_MIN_HEIGHT = height * 0.05;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

/* ================= HELPERS ================= */

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/* ================= COMPONENT ================= */

const ChatListScreen = () => {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const { data: profileData } = useGetProfileQuery();
  const currentUserId = profileData?.id;

  const scrollY = useRef(new Animated.Value(0)).current;

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "chats"),
      where("participantsIds", "array-contains", currentUserId),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList: ChatType[] = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          participantsIds: data.participantsIds || [],
          participants: Array.isArray(data.participants)
            ? data.participants
            : [],
          lastMessage: data.lastMessage || "",
          unreadCount: data.unreadCount || {},
          lastMessageTimestamp: data.lastMessageTimestamp || null,
        } as ChatType;
      });

      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);
  /* ================= ANIMATIONS ================= */

  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const searchOpacity = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const searchTranslate = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
    outputRange: [10, 0],
    extrapolate: "clamp",
  });

  /* ================= FILTER ================= */

  // const filteredChats = chats.filter((chat) => {
  //   if (!Array.isArray(chat.participants)) return false;

  //   const otherUser = chat.participants.find((p) => p.id !== currentUserId);

  //   if (!otherUser?.name) return false;

  //   return otherUser.name.toLowerCase().includes(search.toLowerCase());
  // });

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: { item: ChatType }) => {
    const otherUser = Array.isArray(item.participants)
      ? item.participants.find((p) => p.id !== currentUserId)
      : undefined;

    const name = otherUser?.name || "Unknown User";
    const unread = item.unreadCount?.[currentUserId] ?? 0;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          console.log("Navigating to chat with:", {
            id: otherUser?.id || "",
            name,
            phone: otherUser?.phone || "",
          });
          router.push({
            pathname: "/chats/[id]",
            params: {
              id: otherUser?.id || "",
              name,
              phone: otherUser?.phone || "",
            },
          });
        }}
        className="flex-row items-center px-5 py-4 border-b border-gray-100"
      >
        <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mr-4">
          <Text className="text-blue-600 font-bold">{getInitials(name)}</Text>
        </View>

        <View className="flex-1">
          <Text
            className={`text-base ${
              unread > 0 ? "font-bold" : "text-gray-800"
            }`}
          >
            {name}
          </Text>

          <View className="flex-row items-center justify-between mt-1">
            <Text
              numberOfLines={1}
              className={`flex-1 ${
                unread > 0 ? "font-semibold" : "text-gray-500"
              }`}
            >
              {item.lastMessage || "Start a conversation"}
            </Text>

            {unread > 0 && (
              <View className="ml-2 bg-blue-600 rounded-full min-w-[22px] h-6 items-center justify-center px-1">
                <Text className="text-white text-xs font-bold">
                  {unread > 99 ? "99+" : unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  /* ================= MAIN ================= */

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Animated Header */}
      <Animated.View
        style={{ height: headerHeight }}
        className="justify-end px-5 pb-4 border-b border-gray-100"
      >
        {/* Large Title */}
        <Animated.Text
          style={{ opacity: titleOpacity }}
          className="text-3xl font-bold text-black"
        >
          Messages
        </Animated.Text>

        {/* Animated Search */}
        <Animated.View
          style={{
            opacity: searchOpacity,
            transform: [{ translateY: searchTranslate }],
          }}
          className="absolute bottom-3 left-5 right-5"
        >
          <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
            <Search size={18} color="#666" />
            <TextInput
              placeholder="Search chats"
              value={search}
              onChangeText={setSearch}
              className="ml-2 flex-1"
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Chat List */}
      <Animated.FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        ListEmptyComponent={() => {
          return (
            <View className="flex-1 items-center justify-center">
              <Text className="text-center text-gray-500 mt-10">
                No chats found
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default ChatListScreen;
