import { AlertCircle, Check, CheckCheck, Clock } from "lucide-react-native";
import React from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const MessageBubble = ({
  message,
  isMine,
  onReply,
  onDelete,
  onRetry,
}: any) => {
  const isSending = message.status === "sending";
  const isFailed = message.status === "failed";

  /* -------------------------------------------------- */
  /* 📋 Long Press Options */
  /* -------------------------------------------------- */

  const showOptions = () => {
    if (message.deleted || isSending) return;

    const options: any[] = [];

    if (message.text) {
      options.push({
        text: "Copy",
        onPress: () => {
          console.log("Copy:", message.text);
        },
      });
    }

    if (isMine && !isFailed) {
      options.push({
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete?.(message.id),
      });
    }

    options.push({ text: "Cancel", style: "cancel" });

    Alert.alert("Message Options", "", options);
  };

  /* -------------------------------------------------- */
  /* 🕒 Format Time (Supports Optimistic Date) */
  /* -------------------------------------------------- */

  const formattedTime = (() => {
    if (!message.createdAt) return "";

    const date = message.createdAt?.toDate?.() || new Date(message.createdAt);

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  })();

  /* -------------------------------------------------- */
  /* 🎨 Bubble */
  /* -------------------------------------------------- */

  return (
    <Swipeable
      renderRightActions={() =>
        !message.deleted && !isSending ? (
          <View className="justify-center px-4">
            <Text className="text-lg">↩</Text>
          </View>
        ) : null
      }
      onSwipeableOpen={() => {
        if (!message.deleted && !isSending) {
          onReply?.(message);
        }
      }}
    >
      <Pressable
        onLongPress={showOptions}
        onPress={() => {
          if (isFailed) onRetry?.(message);
        }}
      >
        <View
          className={`m-2 px-3 py-2 rounded-2xl max-w-[80%] ${
            message.deleted
              ? "bg-gray-200 self-start"
              : isMine
                ? "bg-[#DCF8C6] self-end"
                : "bg-white self-start"
          }`}
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
          }}
        >
          {/* 🗑 Deleted */}
          {message.deleted ? (
            <Text className="text-gray-500 italic text-[14px]">
              This message was deleted
            </Text>
          ) : (
            <>
              {/* 🖼 Image */}
              {message.imageUrl ? (
                <Image
                  source={{ uri: message.imageUrl }}
                  className="w-48 h-48 rounded-xl mb-2"
                  resizeMode="cover"
                />
              ) : null}

              {/* 💬 Text */}
              {message.text ? (
                <Text
                  className={`text-[15px] ${
                    isMine ? "text-gray-800" : "text-black"
                  }`}
                >
                  {message.text}
                </Text>
              ) : null}

              {/* ⚠ Failed Indicator */}
              {isMine && isFailed && (
                <View className="flex-row items-center mt-1">
                  <AlertCircle size={14} color="red" />
                  <Text className="text-[11px] text-red-500 ml-1">
                    Failed • Tap to retry
                  </Text>
                </View>
              )}

              {/* 🕒 Timestamp + Status */}
              <View className="flex-row items-center justify-end mt-1">
                <Text className="text-[10px] text-gray-500 mr-1">
                  {formattedTime}
                </Text>

                {isMine && (
                  <>
                    {/* ⏳ Sending */}
                    {isSending && <Clock size={14} color="gray" />}

                    {/* ❌ Failed */}
                    {isFailed && <AlertCircle size={14} color="red" />}

                    {/* ✔ Sent */}
                    {!isSending && !isFailed && (
                      <>
                        {message.seen ? (
                          <CheckCheck size={14} color="#4FC3F7" />
                        ) : message.delivered ? (
                          <CheckCheck size={14} color="gray" />
                        ) : (
                          <Check size={14} color="gray" />
                        )}
                      </>
                    )}
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </Pressable>
    </Swipeable>
  );
};

export default MessageBubble;
