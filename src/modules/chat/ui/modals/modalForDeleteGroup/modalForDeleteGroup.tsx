import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Image,
    Dimensions,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useChats } from "../../../hooks/useChats";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DELETE } from "../../../../../shared/api/delete";
import { API_BASE_URL } from "../../../../../settings";
import { styles } from "./modalForDeleteGroup.style";
import Dots from "../../../../../shared/ui/icons/dots";
import { router } from "expo-router";
import { useUserContext } from "../../../../auth/context/user-context";

interface ModalChatProps {
    visible: boolean;
    onClose: () => void;
    chat_id: number;
    id_admin: number;
    dotsPosition: { x: number; y: number };
    scrollOffset?: number;
    onMessagesDeleted: () => void;
}

export function ModalForDeleteGroup({
    visible,
    onClose,
    chat_id,
    dotsPosition,
    id_admin,
    scrollOffset = 0,
    onMessagesDeleted,
}: ModalChatProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [tokenUser, setTokenUser] = useState<string | null>(null);
    const { user } = useUserContext();
    const { refetchChats } = useChats();

    const getToken = async (): Promise<string | null> => {
        return await AsyncStorage.getItem("token");
    };

    useEffect(() => {
        getToken().then(setTokenUser);
    }, []);

    const modalWidth = 200;
    const modalHeight = 140;
    const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

    const adjustedX = Math.max(
        10,
        Math.min(
            dotsPosition?.x ? dotsPosition.x - modalWidth + 33 : 0,
            screenWidth - modalWidth - 10,
        ),
    );

    const adjustedY = dotsPosition?.y ? dotsPosition.y - scrollOffset + 3 : 0;
    const clampedY = Math.min(Math.max(adjustedY, 10), screenHeight - modalHeight - 10);

    async function handleDeleteMessages(chatId: number) {
        if (!tokenUser) {
            Alert.alert("Помилка", "Не вдалося отримати токен користувача");
            return;
        }

        setIsDeleting(true);
        try {
            await DELETE({
                endpoint: `${API_BASE_URL}/messages/${chatId}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenUser}`,
                },
            });

            onMessagesDeleted();
            onClose();
            Alert.alert("Успіх", "Всі повідомлення успішно видалено");
            refetchChats();
            router.back();
        } catch (error) {
            console.log("Помилка видалення:", error);
            Alert.alert("Помилка", "Не вдалося видалити повідомлення");
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleDeleteChat(chatId: number) {
        if (!tokenUser) {
            Alert.alert("Помилка", "Не вдалося отримати токен користувача");
            return;
        }

        setIsDeleting(true);
        try {
            const result = await DELETE({
                endpoint: `${API_BASE_URL}/chats/${chatId}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenUser}`,
                },
            });
            if (result.status == "error") {
                Alert.alert("Помилка", result.message || "Не вдалося видалити чат");
            }
            onMessagesDeleted();
            onClose();
            Alert.alert("Успіх", "Чат видалено");
            refetchChats();
            router.back();
        } catch (error) {
            console.log("Помилка видалення:", error);
            Alert.alert("Помилка", "Не вдалося видалити чат");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <View
                    style={[
                        styles.modalContainer,
                        {
                            top: clampedY,
                            left: adjustedX,
                            width: modalWidth,
                        },
                    ]}
                    onStartShouldSetResponder={() => true}
                >
                    <View style={styles.dotsContainer}>
                        <Dots style={styles.dotsIcon} />
                    </View>
                    <View style={styles.divider} />
                    {user?.id === id_admin ? (
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleDeleteChat(chat_id)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <ActivityIndicator color="red" />
                            ) : (
                                <>
                                    <Image
                                        source={require("../../../../../shared/ui/images/trash.png")}
                                        style={styles.icon}
                                    />
                                    <Text style={[styles.optionText, styles.deleteText]}>
                                        Видалити групу
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => handleDeleteMessages(chat_id)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator color="red" />
                        ) : (
                            <View
                                style={{
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <Image
                                        source={require("../../../../../shared/ui/images/trash.png")}
                                        style={styles.icon}
                                    />
                                    <Text style={[styles.optionText, styles.deleteText]}>
                                        Видалити всі повідомлення
                                    </Text>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
