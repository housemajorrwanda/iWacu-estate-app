import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export default function ChatsLayout() {
  return (
    <>
      <GestureHandlerRootView className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="chatListScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="[id]" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </>
  );
}
