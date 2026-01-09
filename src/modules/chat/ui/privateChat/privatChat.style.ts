import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    chatName: {
        color: "#070A1C",
        fontWeight: "500",
        fontSize: 24,
    },
    chatInfo: {
        fontSize: 14,
        color: "#666",
    },
    menuBtn: {
        padding: 8,
    },
    chatDate: {
        color: "#666666",
        textAlign: "center",
        fontSize: 14,
    },
    dateContainer: {
        backgroundColor: "#E9E5EE",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    messages: {
        flexGrow: 1,
        paddingHorizontal: 12,
        gap: 8,
    },
    message: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 20,
    },
    messageBubble: {
        borderWidth: 1,
        borderColor: "#E9E5EE",
        padding: 10,
        borderRadius: 10,
        maxWidth: width * 0.7,
        backgroundColor: "#fff",
    },
    messageBubbleMy: {
        backgroundColor: "#CDCED2",
        padding: 10,
        borderRadius: 10,
        maxWidth: width * 0.7,
        alignSelf: "flex-end",
    },
    messageText: {
        fontSize: 16,
        color: "#000",
    },
    messageBox: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        alignSelf: "flex-end",
    },
    messageTime: {
        color: "#666",
        fontSize: 12,
        marginRight: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        height: 44,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingHorizontal: 15,
        backgroundColor: "#f9f9f9",
    },
    attachBtn: {
        padding: 10,
    },
    sendBtn: {
        padding: 10,
        backgroundColor: "#543c52",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    messageImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedImagesContainer: {
        padding: 10,
        backgroundColor: "#f5f5f5ff",
        minHeight: 220,
    },
    previewImageWrapper: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    selectedImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
    },
    removeImageButton: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#ff4444",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    removeImageText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
});
