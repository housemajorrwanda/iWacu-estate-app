import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// import { FlatList } from "react-native-reanimated/lib/typescript/Animated";
import { height, TAB_BAR_HEIGHT, width } from "@/components/global";
import { usePayMutation } from "@/redux/Slice/Paymentslice";
import { url } from "@/url";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";
export default function Booking() {
  const [phone_number, setMobileNumber] = useState<string>("");
  const { houseId, price } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [savedNumbers, setSavedNumbers] = useState([]);
  const [pay, { isLoading, error, isSuccess }] = usePayMutation();
  const paymentIntervalRef = useRef<NodeJS.Timeout | null>(null);
  //   const [client_notes, setClientNotes] = useState<string>("");
  const [amount, setAmount] = useState<number>(
    price ? parseInt(price as string) : 5000,
  );
  const [activeTab, setActiveTab] = useState<"momo" | "paypal" | "card">(
    "momo",
  );
  useEffect(() => {
    const getSavedNumber = async () => {
      const result = await fetch(`${url}/api/payment/savedNumbers`, {
        method: "GET",
        headers: {
          Authorization: `Token ${await AsyncStorage.getItem("token")}`,
        },
      });
      const savedNumbers = await result.json();
      console.log(savedNumbers);
      setSavedNumbers(savedNumbers);
    };
    getSavedNumber();
  }, []);
  const getNetwork = (number: string) => {
    if (number.startsWith("078")) {
      return {
        name: "MTN",
        color: "#FFCC00", // MTN Yellow
        textColor: "#000",
        logo: require("@/assets/images/mtnlogo.jpg"),
      };
    }

    if (number.startsWith("072") || number.startsWith("073")) {
      return {
        name: "Airtel",
        color: "#E60000", // Airtel Red
        textColor: "#fff",
        logo: require("@/assets/images/Airtelogo.jpg"),
      };
    }

    return null;
  };
  const checkPaymentStatus = async (
    transactionId: string,
    phone_number: string,
  ) => {
    try {
      const result = await fetch(`${url}/api/payment/check-payment/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${await AsyncStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          reference_key: transactionId,
          phone_number: phone_number,
        }),
      });

      const data = await result.json();

      return data;
    } catch (err) {
      console.log("Status check error:", err);
      return null;
    }
  };
  const pollPaymentStatus = (transactionId: string, phone_number: string) => {
    let attempts = 0;
    const maxAttempts = 20;

    paymentIntervalRef.current = setInterval(async () => {
      attempts++;

      const statusResponse = await checkPaymentStatus(
        transactionId,
        phone_number,
      );
      console.log(statusResponse);
      if (!statusResponse) return;

      if (statusResponse.status === "success") {
        clearInterval(paymentIntervalRef.current!);
        paymentIntervalRef.current = null;
        setLoading(false);

        Toast.show({
          type: "success",
          text1: "Payment Successful 🎉",
        });

        router.replace("/(tabs)/home/");
      }

      if (statusResponse.status === "failed") {
        clearInterval(paymentIntervalRef.current!);
        paymentIntervalRef.current = null;
        setLoading(false);

        Toast.show({
          type: "error",
          text1: "Payment Failed",
        });
      }

      if (attempts >= maxAttempts) {
        clearInterval(paymentIntervalRef.current!);
        paymentIntervalRef.current = null;
        setLoading(false);

        Toast.show({
          type: "info",
          text1: "Payment Timeout",
        });
      }
    }, 10000);
  };
  const handleBooking = async () => {
    try {
      const bookingDetails = {
        customer_phone: phone_number,
        amount: 100,
        houseId,
      };

      const result = await pay(bookingDetails).unwrap();

      console.log("Initialization Result:", result);

      if (result?.ref) {
        Toast.show({
          type: "info",
          text1: "Payment Initiated",
          text2: "Please confirm payment on your phone...",
        });
        setLoading(true);
        // 🔥 Start checking payment status
        pollPaymentStatus(result.ref, phone_number);
      } else {
        Toast.show({
          type: "info",
          text1: "Invalid Payment",
          text2: "Please try again as this payment appear as invalid",
        });
        router.canGoBack() ? router.back() : router.navigate("/(tabs)/home");
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Payment Initialization Failed",
        text2: "Could not start payment process.",
      });
    }
  };
  // Cancel payment
  const cancelPayment = () => {
    if (paymentIntervalRef.current) {
      clearInterval(paymentIntervalRef.current);
      paymentIntervalRef.current = null;
    }

    setLoading(false);

    Toast.show({
      type: "info",
      text1: "Payment Cancelled",
      text2: "You have cancelled the transaction.",
    });
  };
  const inset = useSafeAreaInsets();
  // const savedNumbers = [
  //   "0782214360",
  //   "0783345678",
  //   "0734456789",
  //   "0785567890",
  //   "0786678901",
  // ];

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingTop: inset.top,
        paddingBottom: TAB_BAR_HEIGHT,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if you have a header
    >
      <Spinner visible={isLoading} size="large" />
      {loading && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/40">
          <View className="bg-white px-6 py-6 rounded-3xl items-center shadow-xl w-[70%]">
            <LottieView
              source={require("@/assets/Animations/loading.json")}
              autoPlay
              loop
              style={{ width: 80, height: 80 }}
            />

            <Text className="mt-3 text-sm text-gray-500 text-center">
              Waiting for payment confirmation...
            </Text>

            <TouchableOpacity
              onPress={cancelPayment}
              className="mt-5 bg-red-500 px-6 py-2 rounded-full"
            >
              <Text className="text-white font-semibold">Cancel Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View
        className="flex flex-row z-80 items-center relative justify-center  bg-secondary "
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 4,
          // paddingTop: inset.top * 1.3,
        }}
      >
        <TouchableOpacity
          className="bg-loading p-2 rounded-full ml-2 absolute left-0"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-gray-900 font-bold text-3xl ml-4">Booking</Text>
      </View>
      <ScrollView
        className="flex-1 w-[94vw] mx-auto"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="bg-[#7A7575]/40 rounded-[2rem]  p-3 my-4 w-[90%] mx-auto">
          <Text className=" text-white text-center my-4">
            This prepayments are refundable, prior to tackle disputes and the
            conflict resolution if arisen
          </Text>
        </View>
        <View className="flex-row w-[90%] mx-auto bg-gray-200 rounded-full p-1 my-4">
          {["momo", "paypal", "card"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 rounded-full ${
                activeTab === tab ? "bg-black" : ""
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === tab ? "text-white" : "text-black"
                }`}
              >
                {tab === "momo" ? "MoMo" : tab === "paypal" ? "PayPal" : "Card"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {activeTab === "momo" && (
          <>
            <View className="flex flex-col mt-4 w-[90%] mx-auto">
              <Text className="text-xl font-bold mb-3">
                Recent Saved Numbers
              </Text>

              {savedNumbers?.length > 0 ? (
                <ScrollView className=" rounded-2xl p-2">
                  {savedNumbers.slice(0, 3).map((number: any, index) => {
                    const network = getNetwork(number?.phone_number);

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setMobileNumber(number?.phone_number)}
                        className="flex-row items-center justify-between bg-white p-3 rounded-xl mb-2 shadow"
                      >
                        <Image
                          source={network?.logo}
                          style={{
                            width: width * 0.2,
                            height: height * 0.05,
                            borderRadius: 20,
                            resizeMode: "cover",
                          }}
                        />
                        <View
                          style={{
                            // backgroundColor: network?.color || "#fff",
                            padding: 14,
                            borderRadius: 18,

                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flex: 1,
                            marginLeft: 10,
                          }}
                        >
                          <Text
                            style={{
                              // color: network?.textColor || "#000",
                              fontWeight: "600",
                            }}
                          >
                            {number?.phone_number}
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="gray"
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <Text className="text-gray-500 font-bold">
                  No saved Number Found..
                </Text>
              )}
            </View>
            <View className="divide-y-2 divide-indigo-500 gap-y-4 flex flex-col items-center justify-center my-4">
              <View className="flex flex-col gap-y-3">
                <Text className="text-muted_text text-md">
                  New Payment Method
                </Text>
                <View className="flex flex-row items-center gap-x-2 w-[90%]">
                  <TextInput
                    className="flex-1 border border-text_muted rounded-md px-2 py-3"
                    placeholder="07822..."
                    keyboardType="numeric"
                    value={phone_number}
                    onChangeText={(e) => setMobileNumber(e)}
                  />
                </View>
              </View>

              <View
                style={{ width: "90%", height: 1, backgroundColor: "#7A7A7A" }}
              />

              <View>
                <View className="w-[80%] flex flex-row items-center justify-between">
                  <Text className="text-lg">Price</Text>
                  <Text className="font-bold text-lg">{amount} RWF</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleBooking()}
                className="bg-black w-[95%] mx-auto py-3 flex flex-col items-center justify-center rounded-full"
              >
                <Text className="text-white font-bold">Book</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === "paypal" && (
          <View className="w-[90%] mx-auto items-center justify-center py-6">
            {/* <Ionicons name="logo-paypal" size={60} color="#003087" /> */}
            <LottieView
              source={require("../../../assets/Animations/comingsoon.json")}
              autoPlay
              loop
              style={{ width: width * 0.8, height: height * 0.3 }}
            />
          </View>
        )}

        {activeTab === "card" && (
          <View className="w-[90%] mx-auto items-center justify-center py-6">
            {/* <Ionicons name="logo-paypal" size={60} color="#003087" /> */}
            <LottieView
              source={require("../../../assets/Animations/comingsoon.json")}
              autoPlay
              loop
              style={{ width: width * 0.8, height: height * 0.3 }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
