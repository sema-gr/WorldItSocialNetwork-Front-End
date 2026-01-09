import { Stack } from "expo-router";
import Providers from "./providers";
import { StatusBar } from "expo-status-bar";
import { Header } from "../src/shared/ui/header";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
    return (
        <Providers>
            <StatusBar style="dark" />
            <SafeAreaProvider style={{ flex: 1, backgroundColor: "#ffffffff" }}>
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="(auth)"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="(chats)"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(friends)" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="settings"
                        options={{
                            contentStyle: { backgroundColor: "#ffffff", flex: 1, marginTop: 30 },
                            header: () => <Header actionType={2} settings={false} />,
                        }}
                    />
                </Stack>
            </SafeAreaProvider>
        </Providers>
    );
}
