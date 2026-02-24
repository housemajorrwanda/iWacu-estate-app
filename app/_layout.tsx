import { store } from "@/redux/store";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../global.css";
import "../i18n";
import { LocationProvider } from "./context/LocationContext";
WebBrowser.maybeCompleteAuthSession();
export default function RootLayout() {
  const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }
  const [loaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_18pt-Black.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_18pt-Bold.ttf"),
    "Manrope-Regular": require("../assets/fonts/Manrope/Manrope.ttf"),
    "Manrope-Medium": require("../assets/fonts/Manrope/Manrope-Medium.ttf"),
    "Manrope-SemiBold": require("../assets/fonts/Manrope/Manrope-SemiBold.ttf"),
    "Manrope-Bold": require("../assets/fonts/Manrope/Manrope-Bold.ttf"),
    "Manrope-ExtraBold": require("../assets/fonts/Manrope/Manrope-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;
  return (
    <LocationProvider>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ClerkProvider publishableKey={clerkKey} tokenCache={tokenCache}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <Toast position="top" />
          </ClerkProvider>
        </GestureHandlerRootView>
      </Provider>
    </LocationProvider>
  );
}
