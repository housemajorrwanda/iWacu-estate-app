import FinanceGroup from "@/components/ProfileComponents/FinancialGroup";
import ProfileCard from "@/components/ProfileComponents/ProfileCard";
import SettingsGroup from "@/components/ProfileComponents/SettingsGroup";
import StatsCard from "@/components/ProfileComponents/StatsCard";
import { useGetProfileQuery } from "@/redux/Slice/userSlice";
import { useClerk, useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Profile() {
  const { signOut } = useClerk();
  const router = useRouter();
  const { user } = useUser();
  console.log(user); // null
  const handleLogout = async () => {
    await signOut();
    await AsyncStorage.removeItem("token");
    router.replace("/auths"); // or your auth screen
  };
  const { data: profileData, error, isLoading } = useGetProfileQuery();
  return (
    <SafeAreaView className="flex-1 bg-[#F6F6F6] w-[95%] mx-auto">
      <ScrollView className="" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6 gap-5">
          <ProfileCard profileData={profileData} />
          <StatsCard profileData={profileData} />
          <SettingsGroup />
          <FinanceGroup />
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="w-[95%] mx-auto rounded-full py-2  items-center justify-center bg-red-500"
        >
          <Text className="text-lg text-white font-bold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    // <SafeAreaView
    //   style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    // >

    // </SafeAreaView>
  );
}
