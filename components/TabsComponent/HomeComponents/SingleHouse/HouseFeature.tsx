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
        {features?.map((feature: HouseFeatureAssignment, index: number) => (
          <TouchableOpacity
            key={index}
            style={{
              width: `${100 / 3 - 4}%`, // approx 30% width with space-between
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 9999,
              paddingVertical: width * 0.02,
              paddingHorizontal: width * 0.025,
              gap: 8,
            }}
          >
            {feature?.feature?.icon && (
              <Image
                source={{ uri: feature?.feature?.icon }}
                style={{ width: width * 0.06, height: width * 0.06 }}
                resizeMode="contain"
              />
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                width: "100%",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              {feature?.custom_feature_name && (
                <Text>{feature?.custom_feature_name}</Text>
              )}
              {feature?.feature?.show_name_only && (
                <Text>{feature?.feature?.name}</Text>
              )}
              {feature?.available_number && (
                <Text className="text-bold text-base">
                  {feature?.available_number}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
