import useSocialAuth from "@/app/hooks/useSocialAuth";
import AppleIcon from "@/assets/images/Apple.svg";
import FacebookIcon from "@/assets/images/Facebook.svg";
import GoogleIcon from "@/assets/images/Google.svg";
import { height, width } from "@/components/global";
import { useGetProfileQuery } from "@/redux/Slice/userSlice";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
export default function Index() {
  const [activeLogin, setActiveLogin] = useState(0);
  const [loadingToken, setLoadingToken] = useState(true);
  const { signInWithOAuth, loading: socialAuthLoading } = useSocialAuth();
  const { isLoaded, userId } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  // ✅ Load token safely
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
      setLoadingToken(false);
    };
    loadToken();
  }, []);

  // ✅ Fetch profile only when everything ready
  const {
    data: profile,
    isLoading: profileLoading,
    isSuccess,
  } = useGetProfileQuery(undefined, {
    skip: !token || !isLoaded || !userId,
  });

  // ✅ Safe redirect (no loop)
  useEffect(() => {
    if (isSuccess && profile) {
      router.replace("/(tabs)/home");
    }
  }, [isSuccess]);

  const isLoading = loadingToken || socialAuthLoading || profileLoading;

  const SocialMedias = [
    { name: "Google", icon: GoogleIcon },
    { name: "Facebook", icon: FacebookIcon },
    { name: "Apple", icon: AppleIcon },
  ];

  const LoginButton = [{ name: "Login" }, { name: "Sign Up" }];

  return (
    <View className="flex-1 flex flex-col">
      {isLoading && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/30">
          <View className="bg-white px-6 py-5 rounded-2xl items-center shadow-lg">
            <ActivityIndicator size="large" color="#34A853" />
            <Text className="mt-3 text-base font-semibold text-gray-700">
              Loading...
            </Text>
            <Text className="mt-1 text-xs text-gray-400">
              Please wait a moment
            </Text>
          </View>
        </View>
      )}

      <ImageBackground
        source={require("@/assets/images/header.png")}
        className="flex flex-col w-screen h-[58vh]"
      >
        <View className="flex-1 flex flex-col items-start justify-end w-[90vw] mx-auto py-5">
          <Text
            style={{ fontFamily: "Inter" }}
            className="text-4xl font-semiBold text-white"
          >
            Your Next Place
          </Text>
          <Text className="text-4xl font-semiBold text-white">
            which is a better one
          </Text>
        </View>
      </ImageBackground>

      <View className="flex flex-row items-center gap-x-4 justify-center w-[90vw] mx-auto py-4">
        {LoginButton.map((button, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setActiveLogin(index);
              if (index === 1) {
                router.navigate("/auths/signup");
              } else {
                router.replace("/auths/signup");
              }
            }}
            className={`btn w-[40%] items-center justify-center ${
              activeLogin === index ? "bg-black" : ""
            }`}
          >
            <Text
              className={`font-bold ${
                activeLogin === index ? "text-white" : ""
              }`}
            >
              {button.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex flex-row items-center w-[90vw] mx-auto gap-x-2">
        <View className="line" />
        <Text>{activeLogin === 0 ? "or Login With" : "or Sign up with"}</Text>
        <View className="line" />
      </View>

      <View className="flex flex-col gap-y-3 py-5">
        {SocialMedias.map((socialMedia, index) => {
          const Icon = socialMedia.icon;
          return (
            <TouchableOpacity
              key={index}
              onPress={() =>
                signInWithOAuth(
                  socialMedia.name.toLowerCase() as
                    | "google"
                    | "facebook"
                    | "apple",
                )
              }
              disabled={isLoading}
              className="btn py-4 flex flex-row items-center justify-center w-[90%] mx-auto relative"
            >
              <View className="absolute left-0">
                <Icon width={width * 0.1} height={height * 0.03} />
              </View>
              <Text className="font-bold">
                Continue with {socialMedia.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={() => router.navigate("/(tabs)/home")}
        className="self-center w-[50vw] bg-black rounded-full py-2 items-center justify-center"
      >
        <Text className="text-white font-bold text-lg">Skip</Text>
      </TouchableOpacity>
    </View>
  );
}
