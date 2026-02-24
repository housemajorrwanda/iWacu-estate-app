import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  // SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type PaymentMethod = "paypal" | "google" | "apple" | "card";

export default function PaymentsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<PaymentMethod>("card");

  const PaymentRow = ({
    title,
    value,
  }: {
    title: string;
    value: PaymentMethod;
  }) => (
    <TouchableOpacity
      onPress={() => setSelected(value)}
      className="flex-row items-center justify-between bg-gray-100 px-4 py-4 rounded-2xl mb-4"
    >
      <Text className="text-base font-medium">{title}</Text>

      <View
        className={`w-5 h-5 rounded-full border-2 ${
          selected === value ? "border-loading bg-loading" : "border-gray-300"
        }`}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-semibold text-gray-500 mt-4">
          Choose the payment method you'd like to use.
        </Text>

        <View className="mt-6">
          <PaymentRow title="Paypal" value="paypal" />
          <PaymentRow title="Google Pay" value="google" />
          <PaymentRow title="Apple Pay" value="apple" />
          <PaymentRow title="**** **** **** 0000" value="card" />

          <TouchableOpacity
            onPress={() => router.push("/profile/add-card")}
            className="bg-gray-200 py-4 rounded-2xl mt-2 items-center"
          >
            <Text className="font-medium text-gray-600">+ Add New Card</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity className="bg-loading py-4 rounded-full mb-6">
        <Text className="text-white text-center font-bold text-lg">Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
