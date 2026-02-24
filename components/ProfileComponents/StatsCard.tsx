import { DollarSign, Home, Users } from "lucide-react-native";
import { Text, View } from "react-native";

export default function StatsCard({ profileData }: any) {
  return (
    <View className="bg-white rounded-3xl p-4 shadow-sm flex-row justify-between">
      <StatItem
        icon={<Home size={20} />}
        value={profileData?.total_uploaded || 0}
        label="Total Houses"
      />
      <Divider />
      <StatItem
        icon={<DollarSign size={20} />}
        value={profileData?.expenses || 0}
        label="Total expenses"
      />
      <Divider />
      <StatItem
        icon={<Users size={20} />}
        value={profileData?.total_agents || 0}
        label="Total Agents"
      />
    </View>
  );
}

const StatItem = ({ icon, value, label }: any) => (
  <View className="items-center flex-1">
    {icon}
    <Text className="font-bold mt-1">{value}</Text>
    <Text className="text-gray-500 text-xs">{label}</Text>
  </View>
);

const Divider = () => <View className="w-[1px] bg-gray-200 mx-2" />;
