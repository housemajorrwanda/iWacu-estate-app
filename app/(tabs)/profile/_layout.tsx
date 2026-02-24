import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="currency"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="mortgage"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="payment"
          options={{
            headerShown: false,
          }}
        />
        {/* <Stack.Screen
                    name="[id]"
                    options={{ headerShown:false }}
                /> */}
      </Stack>
    </>
  );
}
