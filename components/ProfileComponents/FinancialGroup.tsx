import { useRouter } from "expo-router";
import { CreditCard, Home, RefreshCw } from "lucide-react-native";
import { View } from "react-native";
import { SettingRow } from "./SettingRow";
export default function FinanceGroup() {
  const router = useRouter();
  return (
    <View className="bg-white rounded-3xl px-4 shadow-sm">
      <SettingRow
        icon={<CreditCard size={20} />}
        title="Payment Options"
        hasArrow
        onPress={() => router.push("/profile/payment")}
      />
      <SettingRow
        icon={<RefreshCw size={20} />}
        title="Currency conversion"
        hasArrow
        onPress={() => router.push("/profile/currency")}
      />
      <SettingRow
        icon={<Home size={20} />}
        title="Mortgage Rates & Land price"
        hasArrow
        onPress={() => router.push("/profile/mortagage")}
      />
    </View>
  );
}
