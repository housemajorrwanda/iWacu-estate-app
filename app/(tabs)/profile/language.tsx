import { changeLanguage } from "@/i18n";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "kiny", label: "Kinyarwanda" },
];

export default function LanguageScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white px-5 pt-6">
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          className="py-4 border-b border-gray-200"
          onPress={() => {
            changeLanguage(lang.code);
            router.back();
          }}
        >
          <Text className="text-base text-gray-800">{lang.label}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}
