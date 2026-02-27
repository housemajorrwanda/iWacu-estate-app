import { Call, Check, Message } from "@/assets/images";
import { width } from "@/components/global";
// import { router } from "expo-router";
import { useRouter } from "expo-router";
import {
  Alert,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "react-native-elements";
export default function Agent({ agent, uploader }: any) {
  const router = useRouter();
  // console.log("Agent data:", agent);
  const handleAgentCall = async (phoneNumber: string) => {
    if (!phoneNumber) {
      Alert.alert("No phone number available");
      return;
    }

    let phoneUrl = "";

    if (Platform.OS === "android") {
      phoneUrl = `tel:${phoneNumber}`;
    } else {
      phoneUrl = `telprompt:${phoneNumber}`; // iOS shows a prompt
    }

    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert("Cannot make a call on this device");
      }
    } catch (error) {
      console.log("Error making call:", error);
      Alert.alert("Failed to make a call");
    }
  };
  const handleChatAgent = () => {
    router.push({
      pathname: `/(tabs)/chats/[id]`,
      params: {
        id: uploader?.id,
        name: uploader?.name || uploader?.email || "Agent",
        phone: uploader?.phone,
        email: uploader?.email,
      },
    });
  };
  return (
    <View className="flex flex-col w-[100%]  mx-auto">
      <Text className="px-2 text-lg text-loading font-bold">Agent</Text>
      <View className="flex flex-row items-center bg-[#D9D9D9]  justify-between rounded-2xl py-5 px-2  gap-x-2">
        <View className="flex flex-row items-center gap-x-3">
          <Avatar
            size="medium"
            rounded
            source={
              agent?.photo
                ? { uri: agent?.photo }
                : require("@/assets/images/icon.png")
            }
            containerStyle={{
              borderWidth: 1,
              borderColor: "#fff",
            }}
          />
          <View className="flex flex-col">
            <Text className="font-bold text-xl">{agent?.name}</Text>
            <View className="flex flex-row  items-center">
              <Text>{agent?.status}</Text>
              <Check width={width * 0.08} height={width * 0.04} />
            </View>
          </View>
        </View>
        <View className="flex flex-row items-center gap-x-2">
          <TouchableOpacity
            onPress={() => handleAgentCall(agent?.phone || agent?.other_phone)}
            className="bg-white rounded-full p-3"
          >
            <Call width={width * 0.05} height={width * 0.05} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleChatAgent()}
            className="bg-white rounded-full p-3"
          >
            <Message width={width * 0.05} height={width * 0.05} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
