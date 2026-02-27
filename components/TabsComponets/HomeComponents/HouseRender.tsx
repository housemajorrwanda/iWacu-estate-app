import Loading from "@/components/Reusable/Loading";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
interface HouseRenderProps {
  houses: any[];
  isLoading?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  refetch: any;
}

const HouseRender = ({
  houses,
  isLoading = false,
  ListHeaderComponent,
  refetch,
}: HouseRenderProps) => {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  // console.log(houses);

  /**
   * Layout calculations (fully responsive)
   */
  const horizontalPadding = 16;
  const gap = 12;

  const itemWidth = (screenWidth - horizontalPadding * 2 - gap) / 2;

  const shortHeight = itemWidth * 1.05;
  const tallHeight = itemWidth * 1.45;

  /**
   * Height logic based on ORIGINAL index
   * Pattern:
   * 0 → Short
   * 1 → Tall
   * 2 → Tall
   * 3 → Short
   * Repeat...
   */
  const getHeightFromGlobalIndex = (index: number) => {
    const pattern = index % 4;

    if (pattern === 0) return shortHeight;
    if (pattern === 1) return tallHeight;
    if (pattern === 2) return tallHeight;
    return shortHeight;
  };

  /**
   * Split into true masonry columns
   */
  const leftColumn = houses.filter((_, i) => i % 2 === 0);
  const rightColumn = houses.filter((_, i) => i % 2 !== 0);

  const renderCard = (item: any, globalIndex: number) => {
    const height = getHeightFromGlobalIndex(globalIndex);

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.92}
        onPress={() => router.push(`/(tabs)/home/${item.id}`)}
        style={{
          marginBottom: gap,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
      >
        <View
          style={{
            width: itemWidth,
            height,
            borderRadius: 28,
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          {/* IMAGE */}
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={400}
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "100%",
              width: "100%",
              backgroundColor: "rgba(0,0,0,0.15)",
            }}
          >
            {/* Premium Gradient Overlay */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                // backgroundColor: "rgba(0,0,0,0.55)",
                // justifyContent: "flex-end",
                padding: 12,
                flexDirection: "column",
                // alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Address */}
              <Text
                className="capitalize"
                numberOfLines={1}
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                  letterSpacing: 0.3,
                  fontFamily: "Manrope-ExtraBold",
                }}
              >
                {item.address}
              </Text>

              {/* Price */}
              <Text
                className="text-sm font-bold"
                style={{
                  color: "#fff",

                  fontWeight: "bold",
                  // marginTop: 6,
                  opacity: 1.5,
                }}
              >
                RWF {Number(item.price).toLocaleString()}
              </Text>
              {/* {!item?.is_booked && (
                <View className="z-30 absolute -top-[0.5vh] -right-[7vw]">
                  <Booked
                    width={smallIconSize.width}
                    height={smallIconSize.height}
                  />
                </View>
              )} */}
            </View>

            {/* Payment Badge */}
            <View
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                backgroundColor: "rgba(255,255,255,0.85)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                // backdropFilter: "blur(10px)",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#111",
                }}
              >
                {item.payment_category}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  /**
   * Empty state
   */
  if (!houses.length && !isLoading) {
    return (
      <>
        {ListHeaderComponent}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginTop: 60,
          }}
        >
          <LottieView
            source={require("@/assets/Animations/NoResult.json")}
            autoPlay
            loop
            style={{ width: 180, height: 180 }}
          />
          <Text style={{ fontWeight: "600" }}>No House Available</Text>
        </View>
      </>
    );
  }

  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        // paddingHorizontal: horizontalPadding,
        paddingTop: 20,
        paddingBottom: 40,
        backgroundColor: "white",
      }}
    >
      {ListHeaderComponent}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: horizontalPadding,
        }}
      >
        {/* LEFT COLUMN */}
        <View>
          {leftColumn.map((item, index) => {
            const globalIndex = index * 2;
            return renderCard(item, globalIndex);
          })}
        </View>

        {/* RIGHT COLUMN */}
        <View>
          {rightColumn.map((item, index) => {
            const globalIndex = index * 2 + 1;
            return renderCard(item, globalIndex);
          })}
        </View>
      </View>

      {isLoading && (
        <View style={{ marginTop: 20 }}>
          <Loading />
        </View>
      )}
    </ScrollView>
  );
};

export default HouseRender;
