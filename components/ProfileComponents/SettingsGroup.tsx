import { useLocation } from "@/src/context/LocationContext";
import { registerForPushNotificationsAsync } from "@/src/Notification";
import { url } from "@/url";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Bell, Globe, MapPin, Shield, User } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SettingRow } from "./SettingRow";

export default function SettingsGroup() {
  const router = useRouter();
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  // const [locationEnabled, setLocationEnabled] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const { locationEnabled, toggleLocation } = useLocation();

  const handleNotificationToggle = async (value: boolean) => {
    setIsLoading(true);
    const token = await registerForPushNotificationsAsync();
    const userToken = await AsyncStorage.getItem("token");
    await fetch(`${url}/api/auth/save-push-token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ push_token: token, value: value }),
    });
    setIsLoading(false);
    setNotificationsEnabled(value);

    // TODO: connect to push notification logic
    console.log("Notifications:", value);
  };

  return (
    <View className="bg-white rounded-3xl px-4 shadow-sm">
      <SettingRow
        icon={<Bell size={20} />}
        title="Notifications"
        isLoading={loading}
        hasSwitch
        value={notificationsEnabled}
        onToggle={handleNotificationToggle}
      />

      <SettingRow
        icon={<Globe size={20} />}
        title={t("language")}
        hasArrow
        onPress={() => router.navigate("/profile/language")}
      />

      <SettingRow icon={<MapPin size={20} />} title={t("location")} hasSwitch />

      <SettingRow
        icon={<Shield size={20} />}
        title="Personal data & protection policy"
        hasArrow
        onPress={() => router.push("/profile/privacy")}
      />
      <SettingRow
        onPress={() => router.push("/profile/editProfile")}
        icon={<User size={20} />}
        title="Account management"
        hasArrow
      />
    </View>
  );
}
