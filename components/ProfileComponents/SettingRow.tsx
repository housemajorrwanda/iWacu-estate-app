import { ChevronRight } from "lucide-react-native";
import { Switch, Text, TouchableOpacity, View } from "react-native";

export const SettingRow = ({
  icon,
  title,
  hasSwitch,
  hasArrow,
  value,
  onToggle,
  onPress,
}: any) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className="flex-row items-center justify-between py-4 border-b border-gray-200"
    onPress={hasArrow ? onPress : undefined}
  >
    <View className="flex-row items-center gap-3">
      {icon}
      <Text className="text-base font-medium text-gray-800">{title}</Text>
    </View>

    {hasSwitch && <Switch value={value} onValueChange={onToggle} />}

    {hasArrow && <ChevronRight size={18} color="#888" />}
  </TouchableOpacity>
);
