import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  proximityInterface,
  useGetProximilityQuery,
  useGetSingleHouseQuery,
} from "@/redux/Slice/houseSlice";

import {
  getDistanceFromLatLonInKm,
  getTime,
} from "@/components/functions/getDistance";

import Error from "@/components/Reusable/Error";
import Loading from "@/components/Reusable/Loading";
import Agent from "@/components/TabsComponent/HomeComponents/SingleHouse/Agent";
import Features from "@/components/TabsComponent/HomeComponents/SingleHouse/HouseFeature";
import { TAB_BAR_HEIGHT } from "@/components/global";

export default function SingleHouse() {
  const { id }: any = useLocalSearchParams();
  const router = useRouter();
  const inset = useSafeAreaInsets();
  const { width, height } = Dimensions.get("screen");

  const { data: house, isLoading, isError } = useGetSingleHouseQuery(id);

  const { data: proximity } = useGetProximilityQuery();

  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [chooseProximity, setChooseProximity] = useState(false);
  const [choosenProximity, setChoosenProximity] =
    useState<proximityInterface | null>(null);
  const handleBookHouse = () => {
    router.push({
      pathname: "/(tabs)/home/booking",
      params: {
        houseId: house?.id,
        price: house?.price,
        // currency: house?.currency,
        // title: house?.title,
      },
    });
  };
  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center">
        <Loading />
      </View>
    );

  if (isError) return <Error />;
  const houseImages = [...(house?.house_images || [])];
  console.log("feature assignments", house?.feature_assignments);

  if (
    house?.thumbnail &&
    !houseImages.some((img) => img.images === house.thumbnail)
  ) {
    houseImages.push({
      id: "thumbnail",
      images: house.thumbnail,
    });
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  const distance =
    choosenProximity &&
    getDistanceFromLatLonInKm(
      parseFloat(choosenProximity?.latitude || "0"),
      parseFloat(choosenProximity?.longitude || "0"),
      parseFloat(house?.latitude || "0"),
      parseFloat(house?.longitude || "0"),
    );

  return (
    <View className="flex-1 bg-black">
      {/* IMAGE SLIDER */}
      <View style={{ height: height * 0.55 }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {houseImages.map((item, index) => {
            console.log(item.images);
            return (
              <ImageBackground
                key={index}
                source={{ uri: item?.images }}
                style={{
                  width,
                  height: height * 0.55,
                }}
              >
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.7)"]}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: 180,
                  }}
                />
              </ImageBackground>
            );
          })}
        </ScrollView>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: inset.top + 10,
            left: 20,
          }}
          className="bg-black/40 p-2 rounded-full"
        >
          <ArrowLeft color="white" />
        </TouchableOpacity>

        {/* Pagination Dots */}
        <View
          style={{
            position: "absolute",
            bottom: height * 0.08,
          }}
          className=" w-full flex-row justify-center"
        >
          {houseImages.map((_, index) => (
            <View
              key={index}
              style={{
                width: currentIndex === index ? width * 0.08 : height * 0.01,
                height: height * 0.01,
                borderRadius: width * 0.8,
                marginHorizontal: 4,
                backgroundColor:
                  currentIndex === index ? "white" : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </View>
      </View>

      {/* GLASS CONTENT CARD */}
      {/* GLASS CONTENT CARD */}
      <View
        style={{
          flex: 1,
          marginTop: -40,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.2,
          shadowRadius: 15,
          elevation: 25,
        }}
        className="rounded-t-[35px] overflow-hidden"
      >
        <BlurView
          intensity={80}
          tint="light"
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.25)",
          }}
        >
          {/* SCROLL CONTENT */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 30,
              paddingBottom: TAB_BAR_HEIGHT, // critical fix
            }}
          >
            {/* TITLE + PRICE */}
            <View className="flex-row justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-2xl font-bold">{house?.title}</Text>
                <Text className="font-bold mt-1">{house?.address}</Text>
              </View>

              <View className="items-end">
                <Text className="text-2xl font-bold ">
                  {house?.currenct || "RWF"} {house?.price}
                </Text>
                <Text>
                  {house?.payment_category === "Rent" ? "/Month" : "For Sale"}
                </Text>
              </View>
            </View>

            {/* PROXIMITY */}
            <View className="mt-5">
              <TouchableOpacity
                onPress={() => setChooseProximity(!chooseProximity)}
                className="border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center bg-white/60"
              >
                <Text>{choosenProximity?.name || "Select proximity"}</Text>
                <ChevronDown size={18} />
              </TouchableOpacity>

              {chooseProximity &&
                proximity?.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setChoosenProximity(item);
                      setChooseProximity(false);
                    }}
                    className="py-2"
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                ))}
            </View>

            {/* DISTANCE */}
            {distance && (
              <View className="flex-row justify-between mt-3">
                <Text>{distance.toFixed(2)} km</Text>
                <Text>{getTime(distance, 40)}</Text>
              </View>
            )}

            <Features features={house?.feature_assignments} />

            <Agent agent={house.agent} uploader={house.uploader_data} />

            {/* DESCRIPTION */}
            <View className="mt-4">
              <Text className="text-lg font-bold mb-2">Description</Text>
              <Text>{house?.description}</Text>
            </View>
            <View
              style={{
                // position: "absolute",
                // bottom: TAB_BAR_HEIGHT,
                marginVertical: height * 0.02,
                width: "100%",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                disabled={house?.is_booked}
                onPress={() => handleBookHouse()}
                className="bg-loading py-4 w-[100%] flex flex-col items-center justify-between rounded-full"
              >
                <Text className="text-white font-bold text-lg">Book now</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          {/* STICKY BUTTON */}
        </BlurView>
      </View>

      {/* BOOK BUTTON */}
    </View>
  );
}
