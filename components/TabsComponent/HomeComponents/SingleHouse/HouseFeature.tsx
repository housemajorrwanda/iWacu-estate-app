import { HouseFeatureAssignment } from "@/redux/Slice/houseSlice";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

export default function Features({ features }: any) {
  console.log("House Feature", features);
  const { height, width } = Dimensions.get("screen");
  return (
    <View style={{ marginTop: height * 0.01, marginBottom: height * 0.01 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        House Features
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          width: width * 0.9,
          alignSelf: "center",
          // paddingVertical: 16,
          rowGap: width * 0.02,
        }}
      >
        {features?.map((item: HouseFeatureAssignment) => {
          const name =
            item?.custom_feature_name || item?.feature_data?.name || "";

          const icon = item?.feature_data?.icon;
          const number = item?.available_number;

          const hasName = !!name;
          const hasIcon = !!icon;
          const hasNumber = !!number;

          return (
            <TouchableOpacity
              key={item?.id}
              style={{
                width: `${100 / 3 - 4}%`,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 9999,
                paddingVertical: width * 0.02,
                paddingHorizontal: width * 0.025,
                gap: 6,
              }}
            >
              {/* ✅ ICON */}
              {hasIcon && (
                <Image
                  source={{ uri: icon }}
                  style={{ width: width * 0.05, height: width * 0.05 }}
                  resizeMode="contain"
                />
              )}

              {/* ✅ NAME */}
              {hasName && !hasIcon && (
                <Text numberOfLines={1} style={{ fontSize: 12 }}>
                  {name}
                </Text>
              )}

              {/* ✅ NUMBER */}
              {hasNumber && (
                <Text style={{ fontWeight: "bold", fontSize: 13 }}>
                  {number}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
