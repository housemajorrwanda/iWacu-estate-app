import { Logo } from "@/assets/images";
import {
  color,
  height,
  smallIconSize,
  TAB_BAR_HEIGHT,
  width,
} from "@/components/global";
import { RootState } from "@/redux/store";
import { useFocusEffect, useRouter } from "expo-router";
import {
  MessageCircle,
  Plus,
  RefreshCcwIcon,
  Search,
  SlidersHorizontal,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import HouseRender from "@/components/TabsComponets/HomeComponents/HouseRender";
import {
  categoryInterface,
  useGetCategoriesQuery,
  useGetHousesQuery,
} from "@/redux/Slice/houseSlice";
import { setCategory } from "@/redux/Slice/StateSlice";
import { AppDispatch } from "@/redux/store";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const inset = useSafeAreaInsets();

  /** CATEGORY UI */
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  /** SEARCH STATE */
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");

  /** Debounce search to reduce API calls */
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchText), 500);
    return () => clearTimeout(timeout);
  }, [searchText]);

  /** FETCH CATEGORIES */
  const {
    data: categories,
    isLoading: categoryLoading,
    isError: categoryError,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  /** GET SELECTED CATEGORY FROM REDUX */
  const { house_category } = useSelector((state: RootState) => state?.states);

  /** FETCH HOUSES FROM BACKEND */
  const {
    data: houses = [],
    isLoading,
    refetch,
    isFetching,
  } = useGetHousesQuery(
    { house_category, search },
    { refetchOnMountOrArgChange: true },
  );

  /** REFRESH WHEN SCREEN FOCUSED */
  useFocusEffect(
    useCallback(() => {
      refetch(); // fetch houses every time screen is focused
    }, [house_category, search]),
  );

  /** FILTER SCREEN RESULTS (price, features, etc.) */
  const filteredHouses = useSelector(
    (state: RootState) => state.filteredHouses?.houses ?? [],
  );

  /** FINAL HOUSES TO SHOW:
   * - If user applied filters from Filter Screen → use them
   * - Otherwise → use backend API result
   */
  const houseState = filteredHouses.length > 0 ? filteredHouses : houses;

  /** HANDLE CATEGORY PRESS */
  const handleCategoryPress = (index: number, id: string) => {
    setActiveCategoryIndex(index); // UI highlight
    dispatch(setCategory(id)); // triggers backend fetch automatically
  };

  /** LIST HEADER (TOP BAR + CATEGORY) */
  const ListHeader = (
    <View className="bg-white">
      {/* TOP BAR */}
      <View className="flex flex-row items-center w-[90vw] gap-x-3 mx-auto mt-3 mb-3">
        <TouchableOpacity
          onPress={() => router.navigate("/(tabs)/home/addhouse")}
          className="rounded-btn w-[10vw] h-[10vw] items-center justify-center bg-gray-100"
        >
          <Plus color="#7A7575" />
        </TouchableOpacity>

        <View className="flex-1 flex-row rounded-btn px-3 bg-gray-100 items-center">
          <Search color="#7A7575" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 ml-2"
            style={{
              paddingVertical: Platform.OS === "ios" ? height * 0.014 : 8,
            }}
            placeholder="Search houses, price, location..."
            placeholderTextColor="#7A7575"
          />
        </View>

        <TouchableOpacity
          onPress={() => router.navigate("/(tabs)/home/filter")}
          className="rounded-btn w-[10vw] h-[10vw] items-center justify-center bg-gray-100"
        >
          <SlidersHorizontal color="#7A7575" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.navigate("/chats/chatListScreen")}
          className="rounded-btn w-[10vw] h-[10vw] items-center justify-center bg-gray-100"
        >
          <MessageCircle />
        </TouchableOpacity>
      </View>

      {/* CATEGORY SECTION */}
      <View className="mb-3">
        {categoryError && (
          <View className="flex flex-row items-center justify-center gap-2">
            <Logo width={smallIconSize.width} height={smallIconSize.height} />
            <Text className="font-bold text-red-500">
              Error Fetching Category
            </Text>
            <TouchableOpacity onPress={refetchCategories}>
              <RefreshCcwIcon color={color.border} size={18} />
            </TouchableOpacity>
          </View>
        )}

        {categoryLoading && (
          <ActivityIndicator
            color={color.loading}
            size={smallIconSize.width * 0.35}
          />
        )}

        {categories && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: width * 0.02,
              justifyContent: "center",
              paddingHorizontal: 10,
              marginTop: 8,
            }}
          >
            {categories.map((item: categoryInterface, index: number) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleCategoryPress(index, item.id)}
                className={`px-[4vw] py-2 rounded-full ${
                  activeCategoryIndex === index ? "bg-black" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`font-bold ${
                    activeCategoryIndex === index
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === "android" ? inset.top : inset.top * 0.7,
        backgroundColor: "white",
        paddingBottom: TAB_BAR_HEIGHT - inset.bottom, // critical fix for bottom padding when keyboard opens
      }}
    >
      <HouseRender
        houses={houseState}
        isLoading={isLoading}
        refetch={refetch}
        // isFetching={isFetching}
        ListHeaderComponent={ListHeader}
        // stickyHeaderIndices={[0]} // ⬅️ make top bar + category sticky
      />
    </View>
  );
}
