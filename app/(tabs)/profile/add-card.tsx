import { useRouter } from "expo-router";
import { useState } from "react";
import {
    // SafeAreaView,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function AddCardScreen() {
  const router = useRouter();

  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-semibold mt-4 mb-6">Add New Card</Text>

        {/* Card Preview */}
        <View className="bg-blue-600 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-bold">Debit Card</Text>

          <Text className="text-white text-xl mt-6 tracking-widest">
            {cardNumber || "1234 5678 9000 0000"}
          </Text>

          <View className="flex-row justify-between mt-6">
            <Text className="text-white">{holderName || "Card Holder"}</Text>
            <Text className="text-white">{expiry || "12/28"}</Text>
          </View>
        </View>

        {/* Card Number */}
        <Text className="mb-2 font-medium">Card Number</Text>
        <TextInput
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
          placeholder="1234 5678 9000 0000"
          className="bg-gray-100 p-4 rounded-2xl mb-4"
        />

        {/* Name */}
        <Text className="mb-2 font-medium">Account Holder Name</Text>
        <TextInput
          value={holderName}
          onChangeText={setHolderName}
          placeholder="John Doe"
          className="bg-gray-100 p-4 rounded-2xl mb-4"
        />

        {/* Expiry + CVV */}
        <View className="flex-row justify-between mb-4">
          <View className="w-[48%]">
            <Text className="mb-2 font-medium">Expiry Date</Text>
            <TextInput
              value={expiry}
              onChangeText={setExpiry}
              placeholder="MM/YY"
              className="bg-gray-100 p-4 rounded-2xl"
            />
          </View>

          <View className="w-[48%]">
            <Text className="mb-2 font-medium">CVV</Text>
            <TextInput
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              secureTextEntry
              placeholder="123"
              className="bg-gray-100 p-4 rounded-2xl"
            />
          </View>
        </View>

        {/* Save Card */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="font-medium">Save Card Information</Text>
          <Switch value={saveCard} onValueChange={setSaveCard} />
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-purple-600 py-4 rounded-full mb-6"
      >
        <Text className="text-white text-center font-bold text-lg">Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
