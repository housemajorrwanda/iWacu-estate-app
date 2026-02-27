import { db } from "@/app/config/firebase";
import ChatHeader from "@/components/ChatComponent/ChatHeader";
import MessageBubble from "@/components/ChatComponent/MessageBuble";
import MessageInput from "@/components/ChatComponent/MessageInput";
import { TAB_BAR_HEIGHT } from "@/components/global";
import { useGetProfileQuery } from "@/redux/Slice/userSlice";
import * as Network from "expo-network";
import { router, useLocalSearchParams } from "expo-router";
// import { setDoc } from "firebase/firestore";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CLOUD_NAME = "dbxh7c6wk";
const UPLOAD_PRESET = "housemajor";

const ChatScreen = () => {
  const { id, name } = useLocalSearchParams();
  const agentId = Array.isArray(id) ? id[0] : (id ?? "");

  const { data: profileData } = useGetProfileQuery();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUserStatus, setOtherUserStatus] = useState<any>(null);

  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const typingTimeout = useRef<any>(null);

  /* -------------------------------------------------- */
  /* 🌐 Network Listener */
  /* -------------------------------------------------- */

  useEffect(() => {
    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected ?? false);
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------- */
  /* 🔥 Create / Get Chat */
  /* -------------------------------------------------- */

  useEffect(() => {
    const createChat = async () => {
      if (!profileData?.id || !agentId) return;
      if (profileData.id === agentId) {
        Toast.show({
          type: "error",
          text1: "Invalid Chat",
          text2: "You cannot chat with yourself.",
        });
        router.back();
        console.log("Cannot chat with yourself");
        return;
      }

      const sortedIds =
        profileData.id < agentId
          ? [profileData.id, agentId]
          : [agentId, profileData.id];

      const generatedChatId = `${sortedIds[0]}_${sortedIds[1]}`;
      const chatRef = doc(db, "chats", generatedChatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participantsIds: sortedIds,
          participants: [
            {
              id: profileData?.id || "",
              name: profileData?.full_name || "User",
              // phone: profileData?.phone || "",
            },
            {
              id: agentId || "",
              name: name || "Agent",
              // phone: phone || "",
            },
          ],
          lastMessage: "",
          lastMessageTimestamp: serverTimestamp(),
          unreadCount: {
            [profileData.id]: 0,
            [agentId]: 0,
          },
        });
      }

      setChatId(generatedChatId);
    };

    createChat();
  }, [profileData?.id, agentId]);

  /* -------------------------------------------------- */
  /* 👂 Listen Messages */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (!chatId) return;

    setIsLoadingMessages(true);

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(list);
        setIsLoadingMessages(false);
      },
      () => {
        setIsLoadingMessages(false);
      },
    );

    return unsubscribe;
  }, [chatId]);

  /* -------------------------------------------------- */
  /* 👤 My Presence */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (!profileData?.id) return;

    const userRef = doc(db, "users", profileData.id);

    const setOnline = async () => {
      await setDoc(userRef, { online: true }, { merge: true });
    };

    const setOffline = async () => {
      await setDoc(
        userRef,
        {
          online: false,
          lastSeen: serverTimestamp(),
          typingTo: null,
        },
        { merge: true },
      );
    };

    const handleAppState = (state: string) => {
      if (state === "active") {
        setOnline();
      } else {
        setOffline();
      }
    };

    // Set online immediately
    setOnline();

    const subscription = AppState.addEventListener("change", handleAppState);

    return () => {
      setOffline();
      subscription.remove();
    };
  }, [profileData?.id]);

  /* -------------------------------------------------- */
  /* 👤 Other User Presence */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (!agentId) return;

    const userRef = doc(db, "users", agentId);

    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setOtherUserStatus(snap.data());
      }
    });

    return unsubscribe;
  }, [agentId]);

  const isTyping =
    otherUserStatus?.typingTo === chatId && otherUserStatus?.online;

  /* -------------------------------------------------- */
  /* ⌨ Typing Handler */
  /* -------------------------------------------------- */

  const handleTyping = (typing: boolean) => {
    if (!profileData?.id || !chatId) return;

    const userRef = doc(db, "users", profileData.id);

    const setTyping = async (value: string | null) => {
      await setDoc(userRef, { typingTo: value }, { merge: true });
    };

    if (typing) {
      // User started typing
      setTyping(chatId);

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      typingTimeout.current = setTimeout(() => {
        setTyping(null);
      }, 2000);
    } else {
      // User manually stopped typing
      setTyping(null);

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    }
  };
  // ================
  // Uploading Image on cloudinary
  // ===========
  const uploadToCloudinary = async (imageUri: string) => {
    const data = new FormData();

    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "chat.jpg",
    } as any);

    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      },
    );

    const json = await res.json();

    if (!json.secure_url) {
      throw new Error("Image upload failed");
    }

    return json.secure_url;
  };
  /* -------------------------------------------------- */
  /* 💬 Send Message */
  /* -------------------------------------------------- */

  const sendMessage = async (text?: string, imageUri?: string) => {
    if (!chatId || !profileData?.id || isSending) return;
    if (!text?.trim() && !imageUri) return;

    setIsSending(true);

    const tempId = `temp_${Date.now()}`;

    const optimisticMessage = {
      id: tempId,
      text: text || "",
      imageUrl: imageUri || null,
      senderId: profileData.id,
      createdAt: new Date(),
      status: "sending",
      type: imageUri ? "image" : "text",
    };

    setMessages((prev) => [optimisticMessage, ...prev]);

    try {
      let imageUrl = null;

      if (imageUri) {
        imageUrl = await uploadToCloudinary(imageUri);
      }

      const docRef = await addDoc(collection(db, "chats", chatId, "messages"), {
        text: text || "",
        imageUrl,
        senderId: profileData.id,
        type: imageUrl ? "image" : "text",
        createdAt: serverTimestamp(),
        delivered: false,
        seen: false,
      });

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: imageUrl ? "📷 Image" : text,
        lastMessageTimestamp: serverTimestamp(),
        [`unreadCount.${agentId}`]: increment(1),
        [`unreadCount.${profileData.id}`]: 0,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, id: docRef.id, status: "sent", imageUrl }
            : msg,
        ),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "failed" } : msg,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const retryMessage = (message: any) => {
    if (message.status !== "failed") return;
    sendMessage(message.text);
  };

  /* -------------------------------------------------- */
  /* 🎨 UI */
  /* -------------------------------------------------- */

  return (
    <View
      className="flex-1 bg-[#ECE5DD]"
      style={{ paddingBottom: TAB_BAR_HEIGHT }}
    >
      <ChatHeader
        user={{
          id: agentId,
          name,
          avatar: otherUserStatus?.avatar,
          isOnline: otherUserStatus?.online,
          lastSeen: otherUserStatus?.lastSeen?.toDate?.(),
        }}
        isTyping={isTyping}
      />

      {!isConnected && (
        <View className="bg-yellow-500 py-1">
          <Text className="text-center text-white text-xs">Connecting...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={insets.top}
      >
        {isLoadingMessages ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#075E54" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 14,
            }}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isMine={item.senderId === profileData?.id}
                onRetry={() => retryMessage(item)}
              />
            )}
          />
        )}

        <MessageInput
          onSend={sendMessage}
          onTyping={handleTyping}
          isSending={isSending}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
