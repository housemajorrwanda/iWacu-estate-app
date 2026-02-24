import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
// import { FlatList } from "react-native-reanimated/lib/typescript/Animated";
import { usePayMutation } from "@/redux/Slice/Paymentslice";
import Spinner from "react-native-loading-spinner-overlay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
// import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";
export default function Booking() {
  const [phone_number, setMobileNumber] = useState<string>("");
  const [pay,{isLoading,error,isSuccess}]=usePayMutation();
//   const [client_notes, setClientNotes] = useState<string>("");
  const [amount, setAmount] = useState<number>(5000);
  const handleBooking = async() => {
    // Implement booking logic here
    const bookingDetails = {
      "customer_phone":phone_number,
      amount,
      // client_notes,
    };
    console.log("Booking Details:", bookingDetails);
    // You can add further processing like API calls here
    const result=await pay(bookingDetails).unwrap();
    console.log("Payment Result:",result);      
    if(isSuccess){
        Toast.show({
            type: "success",
            text1: "Payment Successful",
            text2: "Your payment has been processed successfully.",
          });
        router.replace("/(tabs)/home/")
    }
    else if(error){
        Toast.show({
            type: "error",
            text1: "Payment Failed",
            text2: "There was an error processing your payment. Please try again.",
          });
    }
    
  };
  const inset=useSafeAreaInsets();
  const savedNumbers = [
    '0782214360',
    '0783345678',
    '0784456789',
    '0785567890',
    '0786678901',
  ];
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if you have a header
    >
        <Spinner visible={isLoading} size="large" />
      <ScrollView
        className="flex-1 w-[94vw] mx-auto"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View
            className="flex-row z-80 items-center relative  py-4 bg-secondary "
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 4,
              paddingTop: inset.top * 1.3,
            }}
          >
            <TouchableOpacity className="bg-gray-500 p-2 rounded-full ml-2"
                onPress={() => router.back()}
              
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            
          </View>
          <View className="bg-[#7A7575] rounded-[2rem] p-3 my-4 w-[90%] mx-auto">
            <Text className=" text-white text-center my-4">This prepayments are refundable, prior to tackle disputes and the conflict resolution if arisen</Text>
          </View>
          <View className="flex flex-col mt-4 w-[90%] mx-auto">
            <Text className="text-2xl font-bold">Saved Numbers</Text>
            {/* <Text className="text-muted_text">Please enter your mobile money number to proceed with the payment</Text> */}
            <ScrollView className="bg-gray-100 rounded-lg ">
                {savedNumbers.length >= 0 && (
                    savedNumbers.slice(0,3).map((number, index) => (
                        <TouchableOpacity key={index} className="p-2">
                            <Text className="text-black">{number}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
          </View>
        <View className="divide-y-2 divide-indigo-500 gap-y-4 flex flex-col items-center justify-center my-4">
        <View className="flex flex-col gap-y-3">
          <Text className="text-muted_text text-md">New Payment Method</Text>
          <View className="flex flex-row items-center gap-x-2 w-[90%]">
            <TextInput
              className="flex-1 border border-text_muted rounded-md px-2 py-3"
              placeholder="07822..."
              value={phone_number}
              onChangeText={(e) => setMobileNumber(e)}
            />
          </View>
        </View>

        <View style={{ width: "90%", height: 1, backgroundColor: "#7A7A7A" }} />

        <View>
          <View className="w-[80%] flex flex-row items-center justify-between">
            <Text className="text-lg">Price</Text>
            <Text className="font-bold text-lg">{amount} RWF</Text>
          </View>
        </View>

        
        <TouchableOpacity
          onPress={() => handleBooking()}
          className="bg-black w-[40%] mx-auto py-3 flex flex-col items-center justify-center rounded-full"
        >
          <Text className="text-white font-bold">Book</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      
    </KeyboardAvoidingView>
  );
}
