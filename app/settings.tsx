import { SafeAreaView } from "react-native-safe-area-context";
import Providers from "./providers";
import { AlbumHeader } from "../src/modules/albums/ui/album-header/album-header";

export default function SettingsPage() {
    return (
        <Providers>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
                <AlbumHeader />
            </SafeAreaView>
        </Providers>
    );
}
