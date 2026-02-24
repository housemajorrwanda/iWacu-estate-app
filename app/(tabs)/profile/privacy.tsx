import {
    ChevronDown,
    FileText,
    Lock,
    Phone,
    Shield,
    User,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl"
      >
        <View className="flex-row items-center space-x-3">
          {icon}
          <Text className="text-base font-semibold">{title}</Text>
        </View>
        <ChevronDown size={20} className={`${open ? "rotate-180" : ""}`} />
      </TouchableOpacity>

      {open && (
        <View className="bg-white p-4 border border-gray-100 rounded-b-xl">
          {children}
        </View>
      )}

      {/* Divider */}
      <View className="h-px bg-gray-200 mt-4" />
    </View>
  );
};

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Sticky Header */}
      <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-center">Privacy Policy</Text>
      </View>

      <ScrollView className="px-5 py-6">
        <Section
          title="Introduction"
          icon={<FileText size={20} color="#2563EB" />}
        >
          <Text className="text-gray-600 leading-6">
            HouseMajor values your privacy. This policy explains how we collect,
            use, and protect your personal information when using our platform.
          </Text>
        </Section>

        <Section
          title="Information We Collect"
          icon={<User size={20} color="#2563EB" />}
        >
          <Text className="text-gray-600 leading-6">
            • Full Name{"\n"}• Email Address{"\n"}• Phone Number{"\n"}• Property
            Preferences{"\n"}• Location Data (if enabled)
          </Text>
        </Section>

        <Section
          title="How We Use Your Information"
          icon={<Shield size={20} color="#2563EB" />}
        >
          <Text className="text-gray-600 leading-6">
            • Manage your account{"\n"}• Connect buyers and sellers{"\n"}•
            Improve app experience{"\n"}• Send important updates
          </Text>
        </Section>

        <Section
          title="Data Security"
          icon={<Lock size={20} color="#2563EB" />}
        >
          <Text className="text-gray-600 leading-6">
            We implement industry-standard security measures to protect your
            personal data against unauthorized access or misuse.
          </Text>
        </Section>

        <Section title="Contact Us" icon={<Phone size={20} color="#2563EB" />}>
          <Text className="text-gray-600 leading-6">
            If you have questions regarding this policy, contact us at:
            {"\n"}support@housemajor.com
          </Text>
        </Section>

        {/* Accept Button */}
        <TouchableOpacity className="bg-loading py-4 rounded-xl mt-6">
          <Text className="text-white text-center font-semibold text-lg">
            I Accept
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-xs text-gray-400 mt-4">
          Last updated: February 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
