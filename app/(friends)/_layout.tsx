import { Stack } from "expo-router";
import { Header } from "../../src/shared/ui/header";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendsLayout() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
            <Header />
            <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
    );
}
