import Booked from "@/assets/images/booked.svg";
import { height, smallIconSize, width } from "@/components/global";
import { house } from "@/redux/Slice/houseSlice";
// import { RootState } from "@reduxjs/toolkit/query";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
// import { useSelector } from "react-redux";

const HouseRender = ({ houses, isLoading }: any) => {
  const router = useRouter();

  const renderHouse = ({
    item: house,
    index,
  }: {
    item: house;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/[id]",
            params: { id: house.id },
          })
        }
        style={{
          position: "relative",
          overflow: "visible",
          width: width * 0.45,
        }}
        className="flex flex-col"
      >
        {house?.is_booked && (
          <View className="z-30 absolute -top-[0.5vh] -right-[7vw]">
            <Booked width={smallIconSize.width} height={smallIconSize.height} />
          </View>
        )}
        <View
          className="overflow-hidden"
          style={{
            width: width * 0.43,
            height: height * 0.18,
            borderRadius: width * 0.06,
          }}
        >
          <Image
            style={{
              width: width * 0.43,
              height: height * 0.18,
            }}
            resizeMode="cover"
            // className="w-[100%] h-[100%]"
            source={{
              uri: house?.thumbnail,
            }}
          />
        </View>
        <View className="flex flex-col px-[4vw]">
          <View className="row">
            <Text className="text font-bold">
              {house?.currency ? house?.currency : "RWF"} {house?.price}
            </Text>
            <Text className="text text-sm">For {house?.payment_category}</Text>
          </View>
          <Text className="text">{house?.address}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View className="flex flex-col w-[90vw] mx-auto overflow-visible z-10">
      <Spinner
        size={width * 0.2}
        visible={isLoading}
        overlayColor="rgba(0,0,0,0.6)"
        textContent="House Major ..."
        // customIndicator={<LoadingComponent />}
      />
      {houses?.length > 0 ? (
        <FlatList
          numColumns={2}
          columnWrapperStyle={{
            columnGap: width * 0.02,
          }}
          contentContainerClassName="gap-x-2"
          contentContainerStyle={{
            gap: width * 0.06,
            paddingBottom: height * 0.127, // optional spacing at bottom
          }}
          keyExtractor={(item) => item.id.toString()}
          data={houses}
          renderItem={renderHouse}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex flex-col items-center justify-center ">
          <LottieView
            source={require("@/assets/Animations/NoResult.json")}
            autoPlay
            loop
            style={{ width: width * 0.5, height: width * 0.5 }}
          />
          <Text className="text-center font-bold">
            No House Available at the moment please try again Later
          </Text>
        </View>
      )}
    </View>
  );
};
export default HouseRender;
