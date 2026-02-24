import useSocialAuth from "@/app/hooks/useSocialAuth";
import AppleIcon from "@/assets/images/Apple.svg";
import FacebookIcon from "@/assets/images/Facebook.svg";
import GoogleIcon from "@/assets/images/Google.svg";
import { height, isSmallScreen, width } from "@/components/global";
import { useGetProfileQuery } from "@/redux/Slice/userSlice";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
export interface socialMedia {
  name: string;
  href: string | any;
  icon: any;
}

export default function Index() {
  const [activeLogin, setActiveLogin] = useState(0);
  const [loading, setLoading] = useState(false);
  const { signInWithOAuth, loading: socialAuthLoading } = useSocialAuth();
  const { getToken, userId } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
      setLoading(false);
    };

    loadToken();
  }, []);
  const {
    data: profile,
    isLoading: profileLoading,
    isSuccess,
    isError,
  } = useGetProfileQuery(undefined, {
    skip: !token,
  });
  useEffect(() => {
    if (token ) {
      router.replace("/(tabs)/home");
    }
  }, [token, isSuccess, profile]);

  // const { signOut } = useClerk();
  const SocialMedias: socialMedia[] = [
    { name: "Google", icon: GoogleIcon, href: "/" },
    { name: "Facebook", icon: FacebookIcon, href: "/" },
    { name: "Apple", icon: AppleIcon, href: "/" },
  ];

  const LoginButton = [
    {
      name: "Login",
      href: "/",
    },
    {
      name: "Sign Up",
      href: "/",
    },
  ];
  const router = useRouter();

  // const googleOAuth = useOAuth({ strategy: "oauth_google" });
  // const facebookOAuth = useOAuth({ strategy: "oauth_facebook" });
  // const appleOAuth = useOAuth({ strategy: "oauth_apple" });
  // const signInWithOAuth = async (provider: "google" | "facebook" | "apple") => {
  //   if (loading) return;
  //   setLoading(true);

  //   try {
  //     // If user already has an active session, skip OAuth
  //     if (userId) {
  //       console.log("User already signed in with userId:", userId);
  //       return;
  //     }

  //     let oauth;
  //     switch (provider) {
  //       case "google":
  //         oauth = googleOAuth;
  //         break;
  //       case "facebook":
  //         oauth = facebookOAuth;
  //         break;
  //       case "apple":
  //         oauth = appleOAuth;
  //         break;
  //       default:
  //         return;
  //     }

  //     const { createdSessionId, setActive } = await oauth.startOAuthFlow();
  //     if (!createdSessionId || !setActive) return;

  //     // Activate Clerk session
  //     await setActive({ session: createdSessionId });

  //     // ✅ Get frontend session JWT (waits internally for session to be ready)
  //     const oauthToken = await getToken();
  //     if (!oauthToken) throw new Error("Failed to get OAuth token");

  //     console.log("OAuth token:", oauthToken);
  //     if (!oauthToken) throw new Error("Failed to get Clerk session JWT");

  //     // ✅ Call backend
  //     const res = await fetch(`${url}/api/auth/clerk-login/`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${oauthToken}`,
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     const data = await res.json();
  //     console.log("Backend response:", data);
  //   } catch (err) {
  //     console.error("OAuth error:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <View className="flex-1 flex flex-col">
      {(loading || socialAuthLoading || profileLoading) && (
        <View className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
          <Spinner textContent="Loading..." color="black" size="large" />
        </View>
      )}
      <ImageBackground
        source={require("@/assets/images/header.png")}
        className="flex flex-col w-screen h-[58vh]"
      >
        <View className="flex-1 flex flex-col items-start justify-end w-[90vw] mx-auto py-5">
          <Text
            style={{
              fontFamily: "Inter",
            }}
            className={`${isSmallScreen ? "text-4xl" : "text-4xl"} font-semiBold text-white`}
          >
            Your Next Place
          </Text>
          <Text
            className={`${isSmallScreen ? "text-4xl" : "text-4xl"} font-semiBold text-white`}
          >
            which is a better one
          </Text>
        </View>
      </ImageBackground>
      <View className="flex flex-row items-center gap-x-4 justify-center w-[90vw] mx-auto py-4">
        {LoginButton?.map((button: any, index: number) => {
          return (
            <TouchableOpacity
              onPress={() => {
                setActiveLogin(index);
                if (index == 1) {
                  router.navigate("/auths/signup");
                } else {
                  router.replace("/auths/signup");
                }
              }}
              key={index}
              //   href={button?.href}
              className={`btn flex flex-col items-center justify-center w-[40%] ${activeLogin == index && "bg-black text-white"} font-bold `}
            >
              <Text
                className={`${activeLogin == index && "text-white"} font-bold`}
              >
                {button?.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View className="flex flex-row items-center w-[90vw] mx-auto gap-x-2">
        <View className="line" />
        <Text className="">
          {" "}
          {activeLogin == 0 ? "or Login With" : "or Sign up with"}
        </Text>
        <View className="line" />
      </View>
      {/* Clerk Sign In  */}
      {/* <SignIn  /> */}
      {/* Social Media Login  */}
      <View className="flex flex-col gap-y-3 py-5 ">
        {SocialMedias?.map((socialMedia: socialMedia, index: number) => {
          const Icon = socialMedia?.icon;
          return (
            <TouchableOpacity
              key={index}
              onPress={() =>
                signInWithOAuth(
                  socialMedia.name.toLowerCase() as
                    | "google"
                    | "facebook"
                    | "apple"
                )
              }
              disabled={loading}
              className="btn py-4 flex flex-row items-center justify-center w-[90%] mx-auto relative"
            >
              <View className="absolute left-0">
                <Icon width={width * 0.1} height={height * 0.03} />
              </View>
              <Text className="font-bold ">
                Continue with {socialMedia?.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        onPress={() => router.navigate("/(tabs)/home")}
        className="self-center w-[50vw] bg-black rounded-full py-2 flex flex-col items-center justify-center"
      >
        <Text className="text-white font-bold text-lg">Skip</Text>
      </TouchableOpacity>
    </View>
  );
}
