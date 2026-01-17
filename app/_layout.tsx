import { store } from "@/redux/store";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../global.css";
export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"  options={{headerShown:false}} />
      </Stack>
      <Toast position="top"/>
    </Provider>
  );
}
