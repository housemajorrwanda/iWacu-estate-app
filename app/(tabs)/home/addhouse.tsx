import { Camera, Pdf, Profile, ProfilePlaceholder } from "@/assets/images";
import { getDistanceFromLatLonInKm } from "@/components/functions/getDistance";
import {
  color,
  height,
  smallIconSize,
  TAB_BAR_HEIGHT,
  width,
} from "@/components/global";
import ImagePreview from "@/components/ImagePreview";
import Agent from "@/components/TabsComponent/HomeComponents/SingleHouse/Agent";
import {
  categoryInterface,
  FeatureInterface,
  proximityInterface,
  useGetAdditionalFeaturesQuery,
  useGetCategoriesQuery,
  useGetProximilityQuery,
  useUploadHouseMutation,
} from "@/redux/Slice/houseSlice";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
// import { navigate } from "expo-router/build/global-state/routing";
import { ChevronDown, LocationEdit, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function AddHouse() {
  const inset = useSafeAreaInsets();
  interface location {
    latitude: number;
    longitude: number;
    address?: string;
  }
  const [featureCategory, setFeatureCategory] = useState<any>();
  const [choosenPuporse, setChoosenPurpose] = useState<string>("");
  const [status, setChoosenStatus] = useState<string>("");
  const [showchoosepurpose, setShowChoosePurple] = useState(false);
  const [showchooseStatus, setShowChooseStatus] = useState(false);
  const [turnonLocation, setTurnonLocation] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [previewThumb, setPreviewThumb] = useState(false);
  const [location, setUserLocation] = useState<location>();
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [customImage, setCustomImage] = useState<any>(null);
  const route = useRouter();
  const { data: categories, isLoading } = useGetCategoriesQuery();
  const { data: additionalFeatures, isLoading: featureLoading } =
    useGetAdditionalFeaturesQuery();
  const { data: proximity } = useGetProximilityQuery();
  console.log(additionalFeatures);
  const categorized = {
    featureWithNumber: [] as FeatureInterface[],
    featureWithPhoto: [] as FeatureInterface[],
    featureWithPhotoandNumber: [] as FeatureInterface[],
    featureWithNothing: [] as FeatureInterface[],
  };

  function categorizeFeature(additionalFeatures: FeatureInterface[]) {
    if (!additionalFeatures || !Array.isArray(additionalFeatures))
      return categorized;

    for (const feature of additionalFeatures) {
      const { add_available_number, is_additional_image_required } = feature;

      if (add_available_number && is_additional_image_required) {
        categorized.featureWithPhotoandNumber.push(feature);
      } else if (add_available_number) {
        categorized.featureWithNumber.push(feature);
      } else if (is_additional_image_required) {
        categorized.featureWithPhoto.push(feature);
      } else {
        categorized.featureWithNothing.push(feature);
      }
    }

    return categorized;
  }

  useEffect(() => {
    if (additionalFeatures) {
      const result = categorizeFeature(additionalFeatures);
      setFeatureCategory(result);
      console.log(result);
    }
  }, [additionalFeatures]);
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // ✅ multiple images
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const images = result.assets.map((asset, index) => ({
        uri: asset.uri,
        name: `House Image ${index + 1} ${houseData?.agent?.name}`,
        type: asset.mimeType || "image/jpeg",
      }));

      setHouseData((prev) => ({
        ...prev,
        additionalImages: [...prev.additionalImages, ...images],
      }));
    }
  };
  const purpose = ["Rent", "Sell"];
  const agent_status = ["owner", "blocker"];
  type UIFeature = {
    id: string;
    name: string;
    add_available_number?: boolean;
    is_additional_image_required?: boolean;
  };

  type HouseDataType = {
    category: string;
    address: string;
    thumbnail: { uri: string; type: string; name: string };
    additionalImages: { uri: string; type: string; name: string }[];

    additionalFeatures: Record<
      string,
      {
        number?: string;
        image?: {
          uri: string;
          type: string;
          name: string;
        };
      }
    >;

    // 🆕 USER-ADDED FEATURES
    customFeatures: {
      id: string;
      name: string;
      number?: string;
      image?: {
        uri: string;
        type: string;
        name: string;
      };
    }[];

    proximity: string[];
    purpose: string;
    price: string;
    latitude: number;
    longitude: number;
    agent: {
      name: string;
      status: string;
      id: string;
      upi: string;
      phone: string;
      otherphone: string;
      description: string;
      photo?: { uri: string; type: string; name: string };
    };
  };

  const [houseData, setHouseData] = useState<HouseDataType>({
    category: "",
    address: "",
    longitude: location?.longitude || 0,
    latitude: location?.latitude || 0,
    additionalImages: [],
    thumbnail: {
      uri: "",
      name: "",
      type: "",
    },
    additionalFeatures: {},
    customFeatures: [],
    proximity: [],
    purpose: "",
    price: "",
    agent: {
      name: "",
      status: "",
      id: "",
      upi: "",
      description: "",
      phone: "",
      otherphone: "",
      photo: {
        uri: "",
        type: "",
        name: "",
      },
    },
  });

  const setValue = (key: any, value: any) =>
    setHouseData((prev) => ({ ...prev, [key]: value }));
  // Update Feature
  const updateFeatureInput = (
    featureId: string,
    field: "number" | "image",
    value: any,
  ) => {
    setHouseData((prev) => ({
      ...prev,
      additionalFeatures: {
        ...prev.additionalFeatures,
        [featureId]: {
          ...prev.additionalFeatures[featureId],
          [field]: value,
        },
      },
    }));
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});

    const { latitude, longitude } = location.coords;

    // 🔥 Reverse geocoding
    const addressResponse = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    console.log("Raw Address:", addressResponse);

    const address = addressResponse[0];

    const locationName = `${address.name || ""}, ${address.city || ""}, ${address.region || ""}, ${address.country || ""}`;

    console.log("Location Name:", locationName);

    setUserLocation({ latitude, longitude });

    setHouseData((prev) => ({
      ...prev,
      latitude,
      longitude,
      // location_name: locationName, // save readable name
    }));
    setValue("address", locationName);
  };

  const [uploadHouse, { isLoading: uploadLoading, isSuccess, isError, error }] =
    useUploadHouseMutation();
  // Creating FormData and uploading house

  const handleUpload = async () => {
    try {
      const result = await uploadHouse(houseData).unwrap();

      Toast.show({
        type: "success",
        text1: "House uploaded successfully!",
      });
      console.log("Upload result:", result);
      setHouseData({
        category: "",
        address: "",
        longitude: location?.longitude || 0,
        latitude: location?.latitude || 0,
        thumbnail: { uri: "", type: "", name: "" },
        additionalFeatures: {},
        additionalImages: [],
        customFeatures: [],
        proximity: [],
        purpose: "",
        price: "",
        agent: {
          name: "",
          status: "",
          id: "",
          upi: "",
          description: "",
          phone: "",
          otherphone: "",
          photo: { uri: "", type: "", name: "" },
        },
      });

      route.push("/(tabs)/home");
    } catch (err: any) {
      console.log(err);

      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: err?.data?.message || "Something went wrong",
      });
    }
  };

  const col1 = width * 0.3; // Feature name
  const col2 = width * 0.2; // Number input
  const col3 = width * 0.38; // Image picker
  const FeatureRow = ({
    feature,
    isCustom = false,
  }: {
    feature: UIFeature;
    isCustom?: boolean;
  }) => {
    const featureInput = isCustom
      ? houseData.customFeatures.find((f) => f.id === feature.id) || {}
      : houseData.additionalFeatures[feature.id] || {};

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
        }}
      >
        {/* COLUMN 1 — NAME */}
        <View style={{ width: col1 }}>
          <Text numberOfLines={1} style={{ fontWeight: "600" }}>
            {feature.name}
          </Text>
        </View>

        {/* COLUMN 2 — NUMBER */}
        <View style={{ width: col2, alignItems: "center" }}>
          {feature.add_available_number ? (
            <TextInput
              placeholder="0"
              keyboardType="numeric"
              value={featureInput.number || ""}
              onChangeText={(text) => {
                if (isCustom) {
                  setHouseData((prev) => ({
                    ...prev,
                    customFeatures: prev.customFeatures.map((f) =>
                      f.id === feature.id ? { ...f, number: text } : f,
                    ),
                  }));
                } else {
                  updateFeatureInput(feature.id, "number", text);
                }
              }}
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                width: "90%",
                textAlign: "center",
              }}
            />
          ) : (
            <View /> // empty placeholder keeps alignment
          )}
        </View>

        {/* COLUMN 3 — IMAGE */}
        <View style={{ width: col3, alignItems: "flex-end" }}>
          {feature.is_additional_image_required ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  maxWidth: col3 * 0.5,
                  fontSize: 12,
                  fontWeight: "bold",
                  marginRight: 6,
                }}
              >
                {featureInput.image ? featureInput.image.name : "Add Image"}
              </Text>

              <TouchableOpacity
                onPress={async () => {
                  let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: "images",
                    allowsEditing: true,
                    quality: 1,
                  });

                  if (!result.canceled) {
                    const asset = result.assets[0];
                    const img = {
                      uri: asset.uri,
                      type: asset.mimeType || "image/jpeg",
                      name: asset.fileName || `feature-${feature.id}.jpg`,
                    };

                    if (isCustom) {
                      setHouseData((prev) => ({
                        ...prev,
                        customFeatures: prev.customFeatures.map((f) =>
                          f.id === feature.id ? { ...f, image: img } : f,
                        ),
                      }));
                    } else {
                      updateFeatureInput(feature.id, "image", img);
                    }
                  }
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Camera width={16} height={16} />
                <Text
                  style={{ fontSize: 12, fontWeight: "bold", marginLeft: 4 }}
                >
                  {featureInput.image ? "Change" : "Upload"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View />
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 relative">
      {uploadLoading && (
        <View className="z-50">
          <Spinner textContent="uploading house..." />
        </View>
      )}
      {/* Custom Feature Modal */}
      <Modal visible={showCustomModal} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "#00000088",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              margin: 20,
              padding: 20,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Add Custom Feature
            </Text>

            <TextInput
              placeholder="Feature Name"
              value={customName}
              onChangeText={setCustomName}
              style={{ borderBottomWidth: 1, marginVertical: 12 }}
            />

            <TextInput
              placeholder="Number (optional)"
              keyboardType="numeric"
              value={customNumber}
              onChangeText={setCustomNumber}
              style={{ borderBottomWidth: 1, marginBottom: 12 }}
            />

            <TouchableOpacity
              onPress={async () => {
                let result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: "images",
                  allowsEditing: true,
                  quality: 1,
                });
                if (!result.canceled) {
                  const asset = result.assets[0];
                  setCustomImage({
                    uri: asset.uri,
                    type: asset.mimeType || "image/jpeg",
                    name: asset.fileName || `custom.jpg`,
                  });
                }
              }}
              style={{ marginBottom: 16 }}
            >
              <Text style={{ color: "#4F46E5", fontWeight: "bold" }}>
                {customImage ? "Change Image" : "Upload Image"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (!customName.trim()) return;

                setHouseData((prev) => ({
                  ...prev,
                  customFeatures: [
                    ...prev.customFeatures,
                    {
                      id: Date.now().toString(),
                      name: customName,
                      number: customNumber || undefined,
                      image: customImage || undefined,
                    },
                  ],
                }));

                setCustomName("");
                setCustomNumber("");
                setCustomImage(null);
                setShowCustomModal(false);
              }}
              style={{
                backgroundColor: "#4F46E5",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Add Feature
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* End of Custom Feature Modal */}
      <View
        style={{ width: width }}
        className="bg-white pt-20 pb-2 px-7 rounded-b-2xl z-50 flex flex-row items-center justify-between w-[100%]"
      >
        <Text className="font-bold text-xl text-border">Add House Details</Text>
        <TouchableOpacity
          onPress={() => handleUpload()}
          className="w-[30%] flex flex-col items-center justify-center py-2 bg-black rounded-full"
        >
          <Text className="text-white font-bold">Upload</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        // stickyHeaderIndices={[0]}
        className=" mx-auto relative"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + inset.bottom - inset.bottom,
        }}
      >
        <View className="w-[95%] relative mx-auto rounded-2xl bg-[#F6F1F1] my-2 flex flex-col border border-border/30 p-2">
          <Text className="text-border font-semibold">Category</Text>
          <View className="flex flex-row items-center flex-wrap">
            {categories?.map((category: categoryInterface, index: number) => {
              return (
                <TouchableOpacity
                  onPress={() => setValue("category", category?.id)}
                  className={`${houseData?.category == category.id ? "bg-black" : "bg-white "} mx-1 my-1 rounded-full px-4 py-2`}
                  key={index}
                >
                  <Text
                    className={`${houseData?.category == category.id ? "text-white font-bold" : "text-black "}`}
                  >
                    {category?.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View className="flex flex-row items-center justify-between">
            <Text className="my-2 text-border text-lg font-bold">
              House Thumbnail
            </Text>
            <TouchableOpacity>
              {!houseData?.thumbnail?.uri ? (
                <TouchableOpacity
                  onPress={async () => {
                    let result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: "images",

                      allowsEditing: true,
                      quality: 1,
                    });
                    if (!result?.canceled) {
                      const asset = result?.assets[0];
                      console.log(asset);
                      setHouseData((prev) => ({
                        ...prev,
                        thumbnail: {
                          uri: asset.uri,
                          name: `House thumbnail ${houseData?.agent?.name}`,
                          type: asset.mimeType || "image/jpeg",
                        },
                      }));
                    }
                  }}
                >
                  <Camera
                    width={smallIconSize.width}
                    height={smallIconSize.height}
                  />
                </TouchableOpacity>
              ) : (
                <View className="flex flex-row items-center gap-x-2">
                  <TouchableOpacity
                    className=""
                    onPress={() => setPreviewThumb(true)}
                  >
                    <Text className="text-blue-700 text-lg font-bold">
                      {houseData?.thumbnail?.name}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-full"
                    onPress={() =>
                      setHouseData((prev) => ({
                        ...prev,
                        thumbnail: {
                          uri: "",
                          name: "",
                          type: "",
                        }, // clear thumbnail completely
                      }))
                    }
                    style={{
                      backgroundColor: "white",

                      padding: 2,
                      borderWidth: 1,
                      borderColor: "red",
                    }}
                  >
                    <X
                      color="red"
                      width={smallIconSize.width * 0.3}
                      height={smallIconSize.width * 0.3}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
            {previewThumb && houseData?.thumbnail?.uri && (
              <View
                className="absolute z-50 w-full rounded-2xl left-0 flex flex-col items-center justify-center top-0"
                style={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  justifyContent: "center",
                  alignItems: "center",
                  elevation: 20,
                  height: height * 0.5,
                  width: width * 0.9,
                }}
              >
                <ImagePreview
                  image={houseData.thumbnail}
                  onDelete={() => setPreviewThumb(false)}
                  size={width * 0.8} // larger for preview
                />

                {/* Optional: close overlay by tapping outside */}
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  onPress={() => setPreviewThumb(false)}
                />
              </View>
            )}
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-border text-lg font-bold">
              Additional House Images
            </Text>
            <TouchableOpacity
              className="relative w-16 h-16  rounded-lg"
              onPress={pickImages}
            >
              {/* First camera icon */}
              <View className="absolute top-5 z-10 -left-1">
                <Camera
                  width={smallIconSize.width * 0.7}
                  height={smallIconSize.height * 0.7}
                />
              </View>

              {/* Second camera icon */}
              <View className="absolute top-0 right-1">
                <Camera
                  width={smallIconSize.width}
                  height={smallIconSize.height}
                />
              </View>
              <View className="absolute top-5 z-10 right-8">
                <Camera
                  width={smallIconSize.width * 0.7}
                  height={smallIconSize.height * 0.7}
                />
              </View>
            </TouchableOpacity>
          </View>
          {/* Scroll View */}
          {houseData.additionalImages.length > 0 && (
            <ScrollView
              contentContainerStyle={{
                height: Dimensions.get("screen").height * 0.13,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: width * 0.02,
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {houseData.additionalImages.map((img, index) => (
                <View
                  key={index}
                  className="relative mr-2"
                  style={{ width: 90, height: 90 }}
                >
                  {/* Thumbnail */}
                  <Image
                    source={{ uri: img.uri }}
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 8,
                    }}
                  />

                  {/* Remove Button */}
                  <TouchableOpacity
                    className="absolute -top-3 -right-3 w-6 h-6 z-50 rounded-full bg-red-600 flex items-center justify-center"
                    onPress={() => {
                      setHouseData((prev) => ({
                        ...prev,
                        additionalImages: prev.additionalImages.filter(
                          (_, i) => i !== index,
                        ),
                      }));
                    }}
                  >
                    <X color="white" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <Text className="my-2 text-border text-lg font-bold">
            Addition House Features
          </Text>

          {/* Feature With Photo and Number */}
          <View className="flex flex-row flex-wrap items-center justify-start">
            {featureCategory?.featureWithPhotoandNumber?.map(
              (feature: FeatureInterface, index: number) => {
                const isSelected = !!houseData.additionalFeatures[feature.id];
                return (
                  <TouchableOpacity
                    onPress={() => {
                      // console.log(houseData);

                      setHouseData((prev) => {
                        const newFeatureInputs = { ...prev.additionalFeatures };
                        if (isSelected) {
                          // unselect
                          delete newFeatureInputs[feature.id];
                        } else {
                          // select
                          newFeatureInputs[feature.id] = {};
                        }
                        return {
                          ...prev,
                          additionalFeatures: newFeatureInputs,
                        };
                      });
                    }}
                    key={index}
                    // className="rounded-full border gap-x-2 flex flex-row-reverse items-center justify-center border-border/40 px-4 py-2"
                    className={`rounded-full border px-4 py-2 mx-1 my-1 flex flex-row-reverse gap-x-1 items-center justify-center ${
                      isSelected
                        ? "bg-blue-200 border-blue-400"
                        : "bg-white border-border/40"
                    }`}
                  >
                    <Text>{feature?.name}</Text>
                    <Image
                      source={{ uri: feature?.icon }}
                      className="w-5 h-5"
                    />
                  </TouchableOpacity>
                );
              },
            )}
          </View>
          {/* Feature With Number */}
          <View className="flex flex-row flex-wrap items-center justify-start">
            {featureCategory?.featureWithNumber?.map(
              (feature: FeatureInterface, index: number) => {
                const isSelected = !!houseData.additionalFeatures[feature.id];
                return (
                  <TouchableOpacity
                    onPress={() => {
                      // console.log(houseData);

                      setHouseData((prev) => {
                        const newFeatureInputs = { ...prev.additionalFeatures };
                        if (isSelected) {
                          // unselect
                          delete newFeatureInputs[feature.id];
                        } else {
                          // select
                          newFeatureInputs[feature.id] = {};
                        }
                        return {
                          ...prev,
                          additionalFeatures: newFeatureInputs,
                        };
                      });
                    }}
                    key={index}
                    // className="rounded-full border gap-x-2 flex flex-row-reverse items-center justify-center border-border/40 px-4 py-2"
                    className={`rounded-full border px-4 py-2 mx-1 my-1 flex flex-row-reverse gap-x-1 items-center justify-center ${
                      isSelected
                        ? "bg-blue-200 border-blue-400"
                        : "bg-white border-border/40"
                    }`}
                  >
                    <Text>{feature?.name}</Text>
                    <Image
                      source={{ uri: feature?.icon }}
                      className="w-5 h-5"
                    />
                  </TouchableOpacity>
                );
              },
            )}
          </View>
          {/* Feature With Photo */}
          <View className="flex flex-row flex-wrap items-center justify-start">
            {featureCategory?.featureWithPhoto?.map(
              (feature: FeatureInterface, index: number) => {
                const isSelected = !!houseData.additionalFeatures[feature.id];
                return (
                  <TouchableOpacity
                    onPress={() => {
                      // console.log(houseData);

                      setHouseData((prev) => {
                        const newFeatureInputs = { ...prev.additionalFeatures };
                        if (isSelected) {
                          // unselect
                          delete newFeatureInputs[feature.id];
                        } else {
                          // select
                          newFeatureInputs[feature.id] = {};
                        }
                        return {
                          ...prev,
                          additionalFeatures: newFeatureInputs,
                        };
                      });
                    }}
                    key={index}
                    // className="rounded-full border gap-x-2 flex flex-row-reverse items-center justify-center border-border/40 px-4 py-2"
                    className={`rounded-full border px-4 py-2 mx-1 my-1 flex flex-row-reverse gap-x-1 items-center justify-center ${
                      isSelected
                        ? "bg-blue-200 border-blue-400"
                        : "bg-white border-border/40"
                    }`}
                  >
                    <Text>{feature?.name}</Text>
                    <Image
                      source={{ uri: feature?.icon }}
                      className="w-5 h-5"
                    />
                  </TouchableOpacity>
                );
              },
            )}
          </View>
          {/* Feature With Nothing */}
          <View className="flex flex-row flex-wrap items-center justify-start">
            {featureCategory?.featureWithNothing?.map(
              (feature: FeatureInterface, index: number) => {
                const isSelected = !!houseData.additionalFeatures[feature.id];
                return (
                  <TouchableOpacity
                    onPress={() => {
                      // console.log(houseData);

                      setHouseData((prev) => {
                        const newFeatureInputs = { ...prev.additionalFeatures };
                        if (isSelected) {
                          // unselect
                          delete newFeatureInputs[feature.id];
                        } else {
                          // select
                          newFeatureInputs[feature.id] = {};
                        }
                        return {
                          ...prev,
                          additionalFeatures: newFeatureInputs,
                        };
                      });
                    }}
                    key={index}
                    // className="rounded-full border gap-x-2 flex flex-row-reverse items-center justify-center border-border/40 px-4 py-2"
                    className={`rounded-full border px-4 py-2 mx-1 my-1 flex flex-row-reverse gap-x-1 items-center justify-center ${
                      isSelected
                        ? "bg-blue-200 border-blue-400"
                        : "bg-white border-border/40"
                    }`}
                  >
                    <Text>{feature?.name}</Text>
                    <Image
                      source={{ uri: feature?.icon }}
                      className="w-5 h-5"
                    />
                  </TouchableOpacity>
                );
              },
            )}
          </View>
          <View>
            {featureCategory?.featureWithPhotoandNumber?.map(
              (f: FeatureInterface) => (
                <FeatureRow key={f.id} feature={f} />
              ),
            )}

            {featureCategory?.featureWithPhoto?.map((f: FeatureInterface) => (
              <FeatureRow key={f.id} feature={f} />
            ))}

            {featureCategory?.featureWithNumber?.map((f: FeatureInterface) => (
              <FeatureRow key={f.id} feature={f} />
            ))}

            {houseData.customFeatures.length > 0 && (
              <>
                <Text style={{ fontWeight: "bold", marginTop: 20 }}>
                  Custom Features
                </Text>

                {houseData.customFeatures.map((f: any) => (
                  <FeatureRow
                    key={f.id}
                    feature={{
                      id: f.id,
                      name: f.name,
                      add_available_number: true,
                      is_additional_image_required: true,
                    }}
                    isCustom
                  />
                ))}
              </>
            )}

            <TouchableOpacity
              onPress={() => setShowCustomModal(true)}
              style={{
                marginTop: 16,
                alignSelf: "flex-start",
                backgroundColor: "#000000",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontWeight: "bold", color: "#FFFFFF" }}>
                + Add Custom Feature
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Additional with Both Features */}

        <View className="w-[95%] mx-auto flex flex-col">
          <Text className="text-border font-bold text-lg">Proximity</Text>
          <View className="rounded-2xl  bg-[#F6F1F1] my-2 flex flex-col border border-border/30 p-2">
            <View className="flex flex-row justify-between w-[100%] items-center">
              <View className="rounded-full border border-border/30 bg-white items-center justify-center px-2 w-[40%] flex flex-row gap-x-2">
                <LocationEdit />
                <TextInput
                  className="flex-1 py-2"
                  placeholder="add Location"
                  value={houseData.address}
                  // value={price} // fallback to empty string
                  onChangeText={(text) =>
                    setHouseData((prev) => ({ ...prev, address: text }))
                  }
                />
              </View>
              <View className=" items-center justify-center px-2 w-[40%] flex flex-row gap-x-2">
                <Text className="text-border/80 font-bold text-sm">
                  Turn On Location
                </Text>
                <Switch
                  value={turnonLocation}
                  onChange={() => {
                    getLocation();
                    setTurnonLocation(!turnonLocation);
                  }}
                />
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: width * 0.04,
                alignItems: "center",
              }}
              style={{ marginVertical: height * 0.015 }}
            >
              {proximity?.map((item: proximityInterface) => {
                const isSelected = houseData.proximity.includes(item.id);

                let distance;
                if (location) {
                  distance = getDistanceFromLatLonInKm(
                    location.latitude,
                    location.longitude,
                    parseFloat(item.latitude),
                    parseFloat(item.longitude),
                  );
                }

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setHouseData((prev) => {
                        let newIds = [...prev.proximity];
                        if (isSelected)
                          newIds = newIds.filter((id) => id !== item.id);
                        else newIds.push(item.id);
                        return { ...prev, proximity: newIds };
                      });
                    }}
                    style={{
                      width: width * 0.26,
                      height: height * 0.16,
                      backgroundColor: isSelected ? "#BFDBFE" : "white",
                      borderRadius: 14,
                      marginRight: width * 0.035,
                      paddingVertical: 10,
                      alignItems: "center",
                      justifyContent: "space-between",
                      elevation: 2,
                    }}
                  >
                    <View style={{ alignItems: "center" }}>
                      <View
                        style={{
                          width: width * 0.16,
                          height: width * 0.16,
                          borderRadius: 100,
                          borderWidth: 1,
                          borderColor: "#ddd",
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <Image
                          source={{ uri: item.icon }}
                          style={{
                            width: width * 0.08,
                            height: width * 0.08,
                            resizeMode: "contain",
                          }}
                        />
                      </View>

                      <Text
                        // numberOfLines={1}
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                          maxWidth: width * 0.22,
                        }}
                      >
                        {item.name}
                      </Text>
                    </View>

                    {distance && (
                      <Text
                        numberOfLines={1}
                        style={{ fontSize: 11, color: "#666" }}
                      >
                        {distance.toFixed(2)} km
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
        <View className="flex flex-row items-center w-[95%] mx-auto justify-between">
          <View className="flex flex-row items-center relative gap-x-2">
            <Text>Purpose</Text>
            <TouchableOpacity
              onPress={() => setShowChoosePurple(!showchoosepurpose)}
              className="bg-white border border-border/40 w-[30vw] px-3 py-2 rounded-full flex flex-row items-center justify-between"
            >
              <Text>{choosenPuporse}</Text>
              <ChevronDown color={color.border} />
            </TouchableOpacity>
            {showchoosepurpose && (
              <TouchableOpacity
                className="border border-border/20 flex flex-col absolute -right-[5vw] bg-white gap-y-2 px-4 rounded-lg top-[3vh]"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 10, height: 5 },
                  shadowRadius: 2,
                  elevation: 20,
                  zIndex: 10,
                }}
              >
                {purpose?.map((item, index) => {
                  return (
                    <TouchableOpacity
                      className="px-3"
                      onPress={() => {
                        setChoosenPurpose(item);
                        setValue("purpose", item);
                        setShowChoosePurple(false);
                      }}
                      key={index}
                    >
                      <Text className="text-lg capitalize font-bold text-border">
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </TouchableOpacity>
            )}
          </View>
          <View className="flex flex-row items-center gap-x-2 w-[40%]">
            <Text>Price</Text>
            <TextInput
              value={houseData.price}
              // value={price} // fallback to empty string
              onChangeText={(text) =>
                setHouseData((prev) => ({ ...prev, price: text }))
              }
              keyboardType="numeric"
              className="bg-white rounded-full border border-border/30 py-2 px-2 flex-1 "
            />
          </View>
        </View>
        <Text className="font-bold text-lg text-border">Agent Details</Text>
        <View className="rounded-2xl  bg-[#F6F1F1] my-2 flex flex-col border border-border/30 p-2">
          <TouchableOpacity
            className="flex flex-col self-start items-center"
            onPress={async () => {
              // Pick image using expo-image-picker or react-native-image-picker

              let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",

                allowsEditing: true,
                quality: 1,
              });
              if (!result?.canceled) {
                setHouseData((prev) => ({
                  ...prev,
                  agent: {
                    ...prev.agent,
                    photo: {
                      uri: result.assets[0]?.uri,
                      name: `${Agent?.name}-profile`,
                      type: result.assets[0].mimeType || "image/jpeg",
                    },
                  },
                }));
              }
            }}
          >
            {houseData.agent.photo?.uri ? (
              <Image
                source={{ uri: houseData.agent.photo.uri }}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <ProfilePlaceholder
                width={smallIconSize.width * 1.6}
                height={smallIconSize.height * 1.6}
              />
            )}
            <Text className="text-border font-bold">Add Photo</Text>
          </TouchableOpacity>

          <View className="flex flex-row items-center justify-between ">
            <View className="bg-white w-[60%] flex flex-row items-center gap-x-2 rounded-full my-2 px-3">
              <Profile
                width={smallIconSize.width * 0.6}
                height={smallIconSize.height * 0.6}
              />
              <TextInput
                className="px-2 flex-1 py-2"
                placeholder="Enter Full Name"
                placeholderTextColor={color.border}
                value={houseData.agent.name}
                onChangeText={(text) =>
                  setHouseData((prev) => ({
                    ...prev,
                    agent: { ...prev.agent, name: text },
                  }))
                }
              />
            </View>
            <View className="flex flex-row items-center relative gap-x-2">
              <TouchableOpacity
                onPress={() => setShowChooseStatus(!showchooseStatus)}
                className="bg-white border border-border/40  w-[30vw] px-3 py-2 rounded-full flex flex-row items-center justify-between"
              >
                <Profile />
                <Text>{status || "Status"}</Text>
                <ChevronDown color={color.border} />
              </TouchableOpacity>
              {showchooseStatus && (
                <TouchableOpacity
                  className="border border-border/20 flex flex-col absolute -right-[5vw] bg-white gap-y-2 px-4 rounded-lg top-[3vh]"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 10, height: 5 },
                    shadowRadius: 2,
                    elevation: 20,
                    zIndex: 10,
                  }}
                >
                  {agent_status?.map((item, index) => {
                    return (
                      <TouchableOpacity
                        className="px-3"
                        onPress={() => {
                          setHouseData((prev) => ({
                            ...prev,
                            agent: { ...prev.agent, status: item },
                          }));
                          setChoosenStatus(item);
                          setShowChooseStatus(false);
                        }}
                        key={index}
                      >
                        <Text className="text-lg capitalize font-bold text-border">
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View className="flex flex-row items-center justify-between ">
            <View className="bg-white w-[60%] flex flex-row items-center gap-x-2 rounded-full my-2 px-3">
              <Pdf
                width={smallIconSize.width * 0.6}
                height={smallIconSize.height * 0.6}
              />
              <TextInput
                className="px-2 flex-1 py-2"
                placeholder="ID"
                keyboardType="numeric"
                placeholderTextColor={color.border}
                value={houseData.agent.id}
                onChangeText={(text) =>
                  setHouseData((prev) => ({
                    ...prev,
                    agent: { ...prev.agent, id: text },
                  }))
                }
              />
            </View>
            <View className="flex flex-row items-center relative gap-x-2">
              <View className="bg-white w-[30vw] flex flex-row items-center gap-x-2 rounded-full my-2 px-3">
                <Pdf
                  width={smallIconSize.width * 0.2}
                  height={smallIconSize.height * 0.5}
                />
                <TextInput
                  className="px-2 text-start py-2 flex-1"
                  placeholder="UPI"
                  placeholderTextColor={color.border}
                  value={houseData.agent.upi}
                  onChangeText={(text) =>
                    setHouseData((prev) => ({
                      ...prev,
                      agent: { ...prev.agent, upi: text },
                    }))
                  }
                />
              </View>
            </View>
          </View>
          <View className="flex flex-row items-center justify-between ">
            <View className="bg-white w-[60%] flex flex-row items-center gap-x-2 rounded-3xl my-2 px-3">
              <TextInput
                className="px-2 flex-1 h-[15vh] text-start max-h-[20vh]"
                placeholder="Comment"
                multiline
                style={{ textAlignVertical: "top" }}
                placeholderTextColor={color.border}
                value={houseData.agent.description}
                onChangeText={(text) =>
                  setHouseData((prev) => ({
                    ...prev,
                    agent: { ...prev.agent, description: text },
                  }))
                }
              />
            </View>
            <View>
              <View className="flex flex-row items-center relative gap-x-2">
                <View className="bg-white w-[35vw] flex flex-row items-center gap-x-2 rounded-full my-2 px-3">
                  <Pdf
                    width={smallIconSize.width * 0.2}
                    height={smallIconSize.height * 0.5}
                  />
                  <TextInput
                    className="px-2 text-start flex-1 py-3"
                    placeholder="phone number"
                    placeholderTextColor={color.border}
                    value={houseData.agent.phone}
                    onChangeText={(text) =>
                      setHouseData((prev) => ({
                        ...prev,
                        agent: { ...prev.agent, phone: text },
                      }))
                    }
                  />
                </View>
              </View>
              <View className="flex flex-row items-center relative gap-x-2">
                <View className="bg-white w-[35vw] flex flex-row items-center gap-x-2 rounded-full my-2 px-3">
                  <Pdf
                    width={smallIconSize.width * 0.2}
                    height={smallIconSize.height * 0.5}
                  />
                  <TextInput
                    className="px-2 text-start py-3 flex-1"
                    placeholder="Other phone"
                    placeholderTextColor={color.border}
                    value={houseData.agent.otherphone}
                    onChangeText={(text) =>
                      setHouseData((prev) => ({
                        ...prev,
                        agent: { ...prev.agent, otherphone: text },
                      }))
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
