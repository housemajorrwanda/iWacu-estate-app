import filterHousesFromAPI from "@/components/functions/filter";
import { color, height, smallIconSize, width } from "@/components/global";
import { setFilteredHouses } from "@/redux/Slice/filterState";
import {
  categoryInterface,
  FeatureInterface,
  useGetAdditionalFeaturesQuery,
  useGetCategoriesQuery,
} from "@/redux/Slice/houseSlice";
import { AppDispatch } from "@/redux/store";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
const MAX_PRICE = 1000000; // Use 1 million as max
const MARKERS = [0, 300000, 600000, 900000, 1000000]; // Visible labels
const SLIDER_WIDTH = width - 40; // padding considered

export default function Filter() {
  interface paymentCategoryInterface {
    name: string;
    key: string;
  }
  const router = useRouter();
  const [active_payment_category, setActiveCategoryPayment] =
    useState<string>("");
  //   const [stepIndex, setStepIndex] = useState(0);
  const [price, setPrice] = useState(0);
  const [choosenHouseType, setChoosenHouseType] = useState<string>("");
  const [houseFeatureWithNumber, setHouseFeatureWithNumber] = useState<any>([]);
  const [houseFeatureWithoutNumber, setHouseFeatureWithoutNumber] =
    useState<any>([]);
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [choosenFeature, setChoosenFeature] = useState<any>([]);
  const formatPrice = (p: number) => {
    if (p >= 900000) return "900k+";
    return `${Math.round(p / 1000) * 1000}`.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ",",
    );
  };
  const payment_category: paymentCategoryInterface[] = [
    { key: "Rent", name: "For Rent" },
    { key: "Sell", name: "For Sell" },
  ];
  // const router=useRouter()
  const { data: category, isLoading: categoryloading } =
    useGetCategoriesQuery();
  const { data: houseFeatures, isLoading: featureLoading } =
    useGetAdditionalFeaturesQuery();
  //   Filtering the house Features
  useEffect(() => {
    if (houseFeatures) {
      const withNumber = houseFeatures.filter(
        (feature: FeatureInterface) => feature?.show_available_number,
      );
      const withoutNumber = houseFeatures.filter(
        (feature: FeatureInterface) => !feature?.show_available_number,
      );
      //   console.log(withoutNumber);

      setHouseFeatureWithNumber(withNumber);
      setHouseFeatureWithoutNumber(withoutNumber);
    }
  }, [houseFeatures]);
  const inset = useSafeAreaInsets();
  function updateFeatureState(key: string, value: string | number) {
    setChoosenFeature((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  }

  const formatFeatures = () => {
    return Object.entries(choosenFeature).map(([key, value]) =>
      value === 1 ? key : `${key}:${value}`,
    );
  };
  const applyFilters = async () => {
    setLoading(true);

    const features = formatFeatures(); // ["Wifi", "Rooms:4"]

    const houses = await filterHousesFromAPI({
      priceMax: price, // slider value
      houseCategory: choosenHouseType, // UUID
      active_payment_category: active_payment_category,
      features,
    });

    dispatch(setFilteredHouses(houses));
    router.navigate("/(tabs)/home");
    setLoading(false);
  };

  return (
    <View
      className="flex-1 flex flex-col"
      style={{
        paddingTop: inset?.top,
      }}
    >
      <Spinner visible={loading} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 w-[90%] mx-auto flex flex-col"
      >
        <TouchableOpacity
          onPress={() =>
            router?.canGoBack()
              ? router.back()
              : router.navigate("/(tabs)/home")
          }
          className="p-2 my-3 w-[13vw] h-[13vw] rounded-full bg-border/60 flex flex-col items-center justify-center"
        >
          <ArrowLeft
            width={smallIconSize.width * 0.2}
            height={smallIconSize.width * 0.2}
          />
        </TouchableOpacity>
        {/* Payment category */}
        <View className="flex flex-row  bg-border rounded-full p-2">
          {payment_category?.map(
            (category: paymentCategoryInterface, index: number) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setActiveCategoryPayment(category?.key)}
                  className={`self-center flex-1 flex flex-col items-center justify-center px-7 py-3 ${active_payment_category == category?.key && "bg-white rounded-full text-border "}`}
                >
                  <Text
                    className={`font-bold ${active_payment_category == category?.key && "text-border"}`}
                  >
                    {category?.name}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </View>
        {/* Price Range */}
        <View style={styles.container}>
          <Text style={styles.label}>
            Price Range: {formatPrice(price)} RWF
          </Text>

          {/* Slider */}
          <Slider
            style={{ width: "100%", height: height * 0.04 }}
            minimumValue={0}
            maximumValue={MAX_PRICE}
            value={price}
            onValueChange={setPrice}
            minimumTrackTintColor={color.border}
            maximumTrackTintColor="#ccc"
            thumbTintColor={color.border}
            // step={null} // smooth scroll
          />

          {/* Tick Marks */}
          <View style={styles.tickContainer}>
            {MARKERS.map((_, index) => (
              <View key={index} style={styles.tickMark} />
            ))}
          </View>

          {/* Labels */}
          <View style={styles.labelsContainer}>
            {MARKERS.map((price, idx) => (
              <Text key={idx} style={styles.tickLabel}>
                {price > 900000 ? "1M+" : `${price / 1000}k`}
              </Text>
            ))}
          </View>
        </View>
        {/* Horizontal Line */}
        <View className="w-[80vw] mx-auto h-[1px] bg-border/60 my-8" />
        {/* House Type Filter */}

        <View className="flex flex-col gap-2">
          <Text className="font-bold text-xl">House Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {category?.map((houseType: categoryInterface, index: number) => {
              return (
                <TouchableOpacity
                  onPress={() => setChoosenHouseType(houseType?.id)}
                  key={index}
                  className={`rounded-full w-[24vw] flex flex-col items-center justify-center py-2 mr-3 ${choosenHouseType == houseType?.id ? "bg-black" : "border border-border"}`}
                >
                  <Text
                    className={`${choosenHouseType == houseType?.id ? "text-white " : "text-border "} font-bold`}
                  >
                    {houseType?.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        {/* Horizontal Line */}
        <View className="w-[80vw] mx-auto h-[1px] bg-border/60 my-8" />
        {/* House Features with Numbers */}
        <View className="flex flex-row items-center justify-between flex-wrap ">
          {houseFeatureWithNumber?.map(
            (feature: FeatureInterface, index: number) => {
              const selectedValue = choosenFeature[feature.id];
              // console.log(selectedValue);

              return (
                <View key={feature.id} className="flex flex-col w-[43vw] mb-2">
                  <Text className="text-lg font-bold">{feature?.name}</Text>
                  <View className="flex flex-row items-center py-1">
                    {Array(4)
                      .fill(0)
                      .map((_, index) => {
                        const num = index + 1;
                        const display = num > 3 ? "4+" : num;
                        const value = num > 3 ? 4 : num;
                        const isSelected = selectedValue === value;

                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() =>
                              updateFeatureState(feature.id, value)
                            }
                            className={`flex rounded-full border items-center justify-center w-[8vw] h-[8vw] mr-1 ${
                              isSelected
                                ? "bg-border border-primary"
                                : "border-border"
                            }`}
                          >
                            <Text
                              className={
                                isSelected ? "text-white" : "text-black"
                              }
                            >
                              {display}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </View>
              );
            },
          )}
        </View>
        {/* Horizontal Line */}
        <View className="w-[80vw] mx-auto h-[1px] bg-border/60 my-8" />
        {/* Features Without number */}
        <View className="flex flex-col">
          <Text className="font-bold text-lg mb-2">
            Amenities & other Services
          </Text>
          <View className="flex flex-col gap-y-3">
            {houseFeatureWithoutNumber?.map(
              (feature: FeatureInterface, index: number) => {
                const isChecked = choosenFeature[feature.name] === 1;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      updateFeatureState(feature.name, isChecked ? 0 : 1)
                    }
                    className="flex flex-row items-center justify-between"
                  >
                    <Text className="text-base">{feature?.name}</Text>
                    <View
                      className={`w-[8vw] h-[8vw] rounded-full border items-center justify-center ${
                        isChecked
                          ? "bg-primary border-primary"
                          : "border-border"
                      }`}
                    >
                      {isChecked && (
                        <View className="w-[3vw] h-[3vw] bg-border rounded-full" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={applyFilters}
          className="bg-black self-center px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    // padding: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: "bold",

    // marginBottom: 12,
  },
  tickContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -height * 0.0245,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  tickMark: {
    width: width * 0.02,
    height: width * 0.02,
    borderRadius: width * 0.02,
    backgroundColor: "#ED6A30",
    zIndex: 10,
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  tickLabel: {
    fontSize: 12,
    color: "#444",
  },
});
function useGeAdditionalFeaturesQuery(): { data: any; isLoading: any } {
  throw new Error("Function not implemented.");
}
