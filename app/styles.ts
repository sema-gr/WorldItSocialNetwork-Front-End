import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
    footer: {
        height: Platform.OS === "ios" ? 88 : 68,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#EAEAEA",
        paddingTop: 10,
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
    },
});
