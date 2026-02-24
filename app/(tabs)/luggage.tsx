import {
  Daihatsu,
  HouseMarker,
  Liphan,
  MotoBike,
  Tax,
  TruckIcon,
} from "@/assets/images";
import { color, height, TAB_BAR_HEIGHT, width } from "@/components/global";
import Error from "@/components/Reusable/Error";
import Loading from "@/components/Reusable/Loading";
import { house, useGetHousesQuery } from "@/redux/Slice/houseSlice";
import { mapapiKey } from "@/url";
import Polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import { MapPin } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GooglePlacesTextInput from "react-native-google-places-textinput";
import MapView, { Marker, Polyline as PolyLineMap } from "react-native-maps";
export default function LuggageDeliver() {
  const { data: houses } = useGetHousesQuery({});
  interface location {
    latitude: number;
    longitude: number;
    address: string;
  }
  const [fromLocation, setFromLocation] = useState<location | null>(null);
  const [toLocation, setToLocation] = useState<location | null>(null);
  const [activeLocation, setActivelocation] = useState<string>("from");
  const [selectedCoords, setSelectedCoords] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mapCoord, setMapCoord] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const Toref = useRef<null>(null);
  const fromRef = useRef<null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${mapapiKey}`,
      );
      const json = await res.json();
      console.log(json);
      const { lat: latitude, lng: longitude } =
        json.results?.[0]?.geometry?.location;
      const address = json?.results?.[0]?.formatted_address;
      const location: location = { latitude, longitude, address };
      if (activeLocation == "from") {
        setFromLocation(location);
        setActivelocation("to");
      } else if (activeLocation == "to") {
        setToLocation(location);
        setActivelocation("from");
      }
    } catch (error) {
      return <Error />;
    } finally {
      setLoading(false);
    }
    // console.log("Selected:", latitude,longitude,address);
  };
  const handlePlaceSelect = async (place: any, destination: string) => {
    try {
      const placeId = place.placeId;
      const fullDetails: any = await getPlaceDetails(placeId);
      if (destination == "from") {
        setFromLocation(fullDetails);
        setActivelocation("to");
      } else if ((destination = "to")) {
        setToLocation(fullDetails);
        setActivelocation("from");
      }
    } catch (error) {
      console.error("Failed to fetch place details", error);
    }
  };
  // Getting Place Details
  const getPlaceDetails = async (placeId: string) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${mapapiKey}`,
    );
    const json = await response.json();
    const location = json.result?.geometry?.location;
    // console.log(json);

    if (location) {
      const address = json.result?.formatted_address;
      // console.log("Coords:", location, "Address:", address);
      return { latitude: location.lat, longitude: location.lng, address };
    } else {
      return <Error />;
    }
  };
  // Now Getting Routing on Map View
  const getRouteDirections = async (
    fromLocation: location,
    toLocation: location,
  ) => {
    try {
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": mapapiKey,
            "X-Goog-FieldMask":
              "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: fromLocation.latitude,
                  longitude: fromLocation.longitude,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: toLocation.latitude,
                  longitude: toLocation.longitude,
                },
              },
            },
            travelMode: "DRIVE",
          }),
        },
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distance = route.distanceMeters / 1000 + " km";
        const duration = route.duration.replace("s", " sec");

        return {
          distance,
          duration,
          polylinePoints: route.polyline.encodedPolyline,
        };
      } else {
        console.error("No routes found:", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Fetch route error:", error);
    }
  };

  useEffect(() => {
    const fetchRoute = async () => {
      if (fromLocation && toLocation) {
        const routeDirection = await getRouteDirections(
          fromLocation,
          toLocation,
        );

        if (routeDirection?.polylinePoints) {
          const coords = Polyline.decode(routeDirection.polylinePoints).map(
            ([latitude, longitude]) => ({
              latitude,
              longitude,
            }),
          );

          setMapCoord(coords);
        }
      }
    };

    fetchRoute();
  }, [fromLocation, toLocation]);
  // Transport Array
  interface meansInterface {
    name: string;
    icon: any;
    price: number;
  }
  const TransportMeans: meansInterface[] = [
    {
      name: "Motobike",
      icon: MotoBike,
      price: 1000,
    },
    {
      name: "Liphan",
      icon: Liphan,
      price: 1500,
    },
    {
      name: "Tax",
      icon: Tax,
      price: 3000,
    },
    {
      name: "Pick up",
      icon: TruckIcon,
      price: 4500,
    },
    {
      name: "Dyna",
      icon: TruckIcon,
      price: 6000,
    },
    {
      name: "Daihatsu",
      icon: Daihatsu,
      price: 9000,
    },
  ];
  return (
    <View className="flex-1 relative">
      <View className="flex flex-col  items-center justify-center gap-y-2 gap-x-2 absolute z-50 top-[10vh] left-[5vw]  mx-auto ">
        <TouchableOpacity
          onPress={() => setActivelocation("from")}
          className="flex w-[90vw] mx-auto self-center flex-row bg-white items-center rounded-full px-2 "
          style={{
            backgroundColor: "white",
            alignItems: "center",
            ...styles.boxShadow,
          }}
        >
          <View className="bg-white">
            <MapPin />
          </View>
          <GooglePlacesTextInput
            ref={fromRef}
            apiKey={mapapiKey}
            onPlaceSelect={(place) => handlePlaceSelect(place, "from")}
            placeHolderText={fromLocation?.address || "From"}
            showClearButton
            style={{
              container: {
                backgroundColor: "transparent", // ✅ key fix
                borderRadius: 0,
                borderWidth: 0,
              },
              input: {
                backgroundColor: "transparent",
                borderWidth: 0,
                zIndex: 0,
                overflowX: "scroll",
              },
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActivelocation("to")}
          className="flex mx-auto w-[90vw] flex-row bg-white items-center rounded-full px-2"
          style={{
            backgroundColor: "white",
            alignItems: "center",
            ...styles.boxShadow,
          }}
        >
          <View className="bg-white">
            <MapPin />
          </View>
          <GooglePlacesTextInput
            ref={Toref}
            apiKey={mapapiKey}
            onPlaceSelect={(place) => handlePlaceSelect(place, "to")}
            placeHolderText={toLocation?.address || "To"}
            showClearButton
            style={{
              container: {
                backgroundColor: "transparent", // ✅ key fix
                borderRadius: 0,
                borderWidth: 0,
              },
              input: {
                backgroundColor: "transparent",
                borderWidth: 0,
                zIndex: 0,
                overflow: "scroll",
              },
            }}
          />
        </TouchableOpacity>
        {loading && <ActivityIndicator color={color.loading} />}
      </View>
      {userLocation ? (
        <MapView
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setSelectedCoords({ latitude, longitude });
            reverseGeocode(latitude, longitude);
          }}
          zoomControlEnabled
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          className="flex-1"
          style={{ flex: 1 }}
        >
          <Marker
            title="My Location"
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
          ></Marker>
          {fromLocation && (
            <Marker
              pinColor="#69E3F7"
              title="Starting Point"
              coordinate={{
                latitude: fromLocation.latitude,
                longitude: fromLocation.longitude,
              }}
            ></Marker>
          )}
          {toLocation && (
            <Marker
              pinColor="#34A853"
              title="Destination"
              coordinate={{
                latitude: toLocation.latitude,
                longitude: toLocation.longitude,
              }}
            ></Marker>
          )}
          {houses?.map((house: house, index: number) => {
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: parseFloat(house?.latitude),
                  longitude: parseFloat(house?.longitude),
                }}
              >
                <HouseMarker width={width * 0.08} height={width * 0.1} />
              </Marker>
            );
          })}
          {mapCoord && (
            <PolyLineMap
              coordinates={mapCoord}
              strokeWidth={4}
              strokeColor="blue"
            />
          )}
        </MapView>
      ) : (
        <Loading />
      )}
      <View
        className="bg-white absolute  w-[98%] left-[1vw] mx-auto rounded-3xl  py-6 items-center justify-center gap-x-3 flex flex-row "
        style={{
          ...styles.boxShadow,
          bottom: TAB_BAR_HEIGHT - height * 0.007,
        }}
      >
        {TransportMeans?.map((means: meansInterface, index: number) => {
          const Icon = means.icon;
          return (
            <TouchableOpacity
              key={index}
              className="flex flex-row relative items-center "
              style={{
                paddingRight: 2,
              }}
            >
              <View className="flex flex-col items-center">
                <View className="w-[10vw] bg-border/20 h-[10vw] border border-border/50 rounded-full flex flex-col center">
                  <Icon width={width * 0.06} height={width * 0.06} />
                </View>
                <Text className="text-border font-bold text-sm">
                  {means?.name}
                </Text>
                <View className="flex flex-row items-center ">
                  <Text className="text-border text-sm">{means?.price}/</Text>
                  <Text className="text-border text-xs">km</Text>
                </View>
              </View>
              {/* <View className="w-[1px] absolute top-0 right-0 h-[100%] bg-border" /> */}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  boxShadow: {
    shadowColor: "#000",
    shadowOffset: { height: 10, width: 10 },
    shadowRadius: 15,
    elevation: 15,
  },
});
