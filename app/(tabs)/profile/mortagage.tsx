import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function MortgageScreen() {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [valuation, setValuation] = useState<string | null>(null);

  const handleSearch = () => {
    // Later this comes from API
    setValuation("Estimated Land Price: 25,000 RWF per m²");
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold mt-6 mb-6">
          Mortgage & Land Price
        </Text>

        <TextInput
          placeholder="Province"
          value={province}
          onChangeText={setProvince}
          className="bg-gray-100 p-4 rounded-2xl mb-4"
        />

        <TextInput
          placeholder="District"
          value={district}
          onChangeText={setDistrict}
          className="bg-gray-100 p-4 rounded-2xl mb-4"
        />

        <TextInput
          placeholder="Sector"
          value={sector}
          onChangeText={setSector}
          className="bg-gray-100 p-4 rounded-2xl mb-6"
        />

        <TouchableOpacity
          onPress={handleSearch}
          className="bg-loading py-4 rounded-full"
        >
          <Text className="text-white text-center font-bold">
            Check Valuation
          </Text>
        </TouchableOpacity>

        {valuation && (
          <View className="bg-gray-100 p-4 rounded-2xl mt-6">
            <Text className="text-lg font-semibold">{valuation}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
