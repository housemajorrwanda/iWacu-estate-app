import { TAB_BAR_HEIGHT } from "@/components/global";
import FinanceGroup from "@/components/ProfileComponents/FinancialGroup";
import ProfileCard from "@/components/ProfileComponents/ProfileCard";
import SettingsGroup from "@/components/ProfileComponents/SettingsGroup";
import StatsCard from "@/components/ProfileComponents/StatsCard";
import { useGetProfileQuery } from "@/redux/Slice/userSlice";
import { useClerk, useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { signOut } = useClerk();
  const router = useRouter();
  const { user } = useUser();

  const {
    data: profileData,
    error,
    isLoading,
    isFetching,
  } = useGetProfileQuery();

  const handleLogout = async () => {
    await signOut();
    await AsyncStorage.removeItem("token");
    router.replace("/auths");
  };

  // 🔐 If no user → go to login
  useEffect(() => {
    if (!user) {
      router.replace("/auths");
    }
  }, [user]);

  // ❌ If API error (like 401 Unauthorized) → logout
  useEffect(() => {
    if (error) {
      console.log("Profile Error:", error);
      handleLogout();
    }
  }, [error]);

  // 🔄 Loading State (Shimmer placeholder can go here)
  if (isLoading || isFetching) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F6F6F6]">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-gray-500">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // ❌ If still no data after loading
  if (!profileData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">
          Failed to load profile. Please login again.
        </Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-4 bg-red-500 px-6 py-2 rounded-full"
        >
          <Text className="text-white font-bold">Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ✅ Normal Screen Render
  return (
    <SafeAreaView
      className="flex-1 bg-[#F6F6F6] w-[95%] mx-auto"
      style={{ paddingBottom: TAB_BAR_HEIGHT }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6 gap-5">
          <ProfileCard profileData={profileData} />
          <StatsCard profileData={profileData} />
          <SettingsGroup />
          <FinanceGroup />
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="w-[95%] mx-auto rounded-full py-2 items-center justify-center bg-red-500"
        >
          <Text className="text-lg text-white font-bold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
