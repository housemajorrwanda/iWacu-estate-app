import { height, width } from "@/components/global";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  name: "Google" | "Facebook" | "Apple";
  icon: any;
  onPress: () => void;
  disabled?: boolean;
}

export function SocialAuthButton({
  name,
  icon: Icon,
  onPress,
  disabled,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="btn py-4 flex flex-row items-center justify-center w-[90%] mx-auto relative"
    >
      <View className="absolute left-0">
        <Icon width={width * 0.1} height={height * 0.03} />
      </View>
      <Text className="font-bold">Continue with {name}</Text>
    </TouchableOpacity>
  );
}
