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
        // 3️⃣ Send token to backend (validate / login)
        const res = await fetch(`${url}/api/auth/clerk-login/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", res.status);

        let data: any = null;
        let errorMessage = "Backend authentication failed";

        const contentType = res.headers.get("content-type");
        console.log("Response content-type:", contentType);

        try {
          if (contentType && contentType.includes("application/json")) {
            data = await res.json();
            console.log("Response JSON:", data);

            if (!res.ok) {
              errorMessage = data?.detail || JSON.stringify(data);
              throw new Error(errorMessage);
            }
          } else {
            const text = await res.text();
            console.log("Non-JSON response:", text);
            errorMessage = text || "Server returned non-JSON response";
            throw new Error(errorMessage);
          }
        } catch (parseError) {
          console.log("Parse error:", parseError);
          throw new Error(errorMessage);
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
