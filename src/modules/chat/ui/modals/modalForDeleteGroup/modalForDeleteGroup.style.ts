import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
    },
    modalContainer: {
        backgroundColor: "#E9E5EE",
        borderRadius: 12,
    },
    dotsContainer: {
        alignItems: "flex-end",
        padding: 5,
    },
    dotsIcon: {
        width: 20,
        height: 20,
    },
    modalOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    optionText: {
        fontSize: 16,
        color: "#070A1C",
        marginLeft: 12,
    },
    deleteText: {
        color: "red",
    },
    divider: {
        height: 1,
        backgroundColor: "#CDCED2",
        marginVertical: 4,
    },
    icon: {
        width: 20,
        height: 20,
    },
});
