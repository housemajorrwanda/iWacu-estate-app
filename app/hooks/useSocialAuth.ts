import { url } from "@/url";
import { useAuth, useOAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
type Provider = "google" | "facebook" | "apple";

export default function useSocialAuth() {
  const { getToken, userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const googleOAuth = useOAuth({ strategy: "oauth_google" });
  const facebookOAuth = useOAuth({ strategy: "oauth_facebook" });
  const appleOAuth = useOAuth({ strategy: "oauth_apple" });

  const signInWithOAuth = useCallback(
    async (provider: Provider) => {
      if (!isLoaded || loading) return;
      setLoading(true);

      try {
        setLoading(true);
        // 1️⃣ If user is NOT signed in → do OAuth
        if (!userId) {
          const oauthMap = {
            google: googleOAuth,
            facebook: facebookOAuth,
            apple: appleOAuth,
          };

          const oauth = oauthMap[provider];
          if (!oauth) throw new Error("Invalid OAuth provider");

          const { createdSessionId, setActive } =
            await oauth.startOAuthFlow();

          if (!createdSessionId || !setActive) {
            throw new Error("OAuth flow failed");
          }

          await setActive({ session: createdSessionId });
        }

        // 2️⃣ Always get Clerk session JWT
        const token = await getToken();
        if (!token) throw new Error("Failed to get Clerk session token");

        // 3️⃣ Send token to backend (validate / login)
        const res = await fetch(`${url}/api/auth/clerk-login/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.detail || "Backend authentication failed");
        }
        await AsyncStorage.setItem("token", data?.token);
        console.log("Backend auth success:", data);

        // 4️⃣ Redirect after successful login
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: "You have been logged in successfully.",
        });
        router.replace("/(tabs)/home");
        return data;
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2:
            error instanceof Error
              ? error.message
              : "An unknown error occurred during authentication.",
        });
        console.log("Social auth error:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, userId, isLoaded]
  );

  return {
    signInWithOAuth,
    loading,
  };
}
