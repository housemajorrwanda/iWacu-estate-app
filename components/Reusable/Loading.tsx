import LottieView from "lottie-react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { width } from "../global";
export default function Loading() {
  return (
    <View className="flex-1 flex flex-row-reverse gap-x-2 items-center justify-center ">
      <View className="absolute inset-0 z-50 items-center justify-center bg-black/30">
        <View className="bg-white px-6 py-5 rounded-2xl items-center shadow-lg w-[50vw] h-[15vh] flex flex-col justify-center ">
          <ActivityIndicator size="large" color="#34A853" />
          <LottieView
            source={require("@/assets/Animations/loading.json")}
            autoPlay
            loop
            style={{ width: width * 0.12, height: width * 0.12 }}
          />
          <Text className="mt-1 text-xs text-gray-400">
            Please wait a moment...
          </Text>
        </View>
      </View>

      {/* <Text className="text-border font-bold">Loading...</Text> */}
    </View>
  );
}
