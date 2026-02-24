import { Stack } from 'expo-router';

export default function HomeLayout() {
    return (
        <>
            <Stack
                screenOptions={{
                    headerShown:false
                }}
            >
                <Stack.Screen name='index' options={{
                    headerShown: false
                }} />
                <Stack.Screen name='filter' options={{
                    headerShown: false
                }} />
                <Stack.Screen name='addhouse' options={{
                    headerShown: false
                }} />
                <Stack.Screen name='booking' options={{
                    headerShown: false
                }} />
                {/* <Stack.Screen
                    name="[id]"
                    options={{ headerShown:false }}
                /> */}

            </Stack>
        </>
    );
}
