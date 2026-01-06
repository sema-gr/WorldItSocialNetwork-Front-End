import React, { useEffect, useState, useRef, ElementRef } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
    Modal,
    Dimensions,
} from "react-native";
import SendArrow from "../../../../shared/ui/icons/send-arrow";
import BackArrowIcon from "../../../../shared/ui/icons/arrowBack";
import { styles } from "./privatChat.style";
import Dots from "../../../../shared/ui/icons/dots";
import CheckMarkIcon from "../../../../shared/ui/icons/checkMark";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_BASE_URL } from "../../../../settings";
import { useSocketContext } from "../../context/socketContext";
import { CreateMessage, MessagePayload } from "../../types/socket";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useUserContext } from "../../../auth/context/user-context";
import { ChatModalDelete } from "../modals/modal/chatModalDelete";
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from "expo-image-picker";

export function PrivatChat() {
    const params = useLocalSearchParams<{
        name: string;
        chat_id: string;
        avatar: string;
        username: string;
        lastAtMessage: string;
    }>();
    const { user } = useUserContext();
    const { socket } = useSocketContext();
    const [dotsPosition, setDotsPosition] = useState({ x: 50, y: 78 });
    const [messages, setMessages] = useState<MessagePayload[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [input, setInput] = useState("");
    const scrollViewRef = useRef<ScrollView>(null);
    const dotsRef = useRef<ElementRef<typeof TouchableOpacity>>(null);
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        if (!socket || !isMounted) return;

        const chatId = +params.chat_id;
        socket.emit("joinChat", { chatId }, res => {
            if (!isMounted) return;
            if (res.status === "success" && Array.isArray(res.data?.chat_messages)) {
                setMessages(res.data.chat_messages);
            }
        });

        const handleNewMessage = (data: CreateMessage) => {
            if (!isMounted) return;
            const newMessage: MessagePayload = {
                content: data.content || "",
                sent_at: new Date(),
                author_id: data.author_id,
                chat_groupId: data.chat_groupId,
                attached_image: data.attached_image || "",
            };
            setMessages(prev => [...prev, newMessage]);
            scrollViewRef.current?.scrollToEnd({ animated: true });
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.emit("leaveChat", { chatId });
        };
    }, [socket, params.chat_id, isMounted]);

    const measureDots = () => {
        if (dotsRef.current) {
            dotsRef.current.measureInWindow((x, y) => {
                setDotsPosition({ x, y });
            });
        }
    };

    useEffect(() => {
        if (modalVisible) {
            measureDots();
        }
    }, [modalVisible, scrollOffset]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 0);
        }
    }, [messages]);

    function formatDate(date: Date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return "Сьогодні";
        if (isYesterday) return "Вчора";
        return date.toLocaleDateString("uk-UA", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    function onBack() {
        router.navigate({
            pathname: "/chats",
        });
    }

    function shouldShowDate(currentMessage: MessagePayload, prevMessage?: MessagePayload) {
        if (!prevMessage) return true;
        const currentDate = new Date(currentMessage.sent_at).toDateString();
        const prevDate = new Date(prevMessage.sent_at).toDateString();
        return currentDate !== prevDate;
    }

    const sendMessage = async () => {
        if ((!input.trim() && selectedImages.length === 0) || !user || !socket) return;

        try {
            setIsUploading(true);

            const newMessage: CreateMessage = {
                content: input.trim(),
                author_id: user.id,
                chat_groupId: +params.chat_id,
                sent_at: new Date(),
                attached_image: selectedImages[0] || "",
            };

            socket.emit("sendMessage", newMessage as MessagePayload);
            setInput("");
            setSelectedImages([]);
            setIsUploading(false);
        } catch (error) {
            setIsUploading(false);
            Alert.alert("Error", "Could not send message");
            console.log("Error request:", error);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Дозвіл не надано", "Потрібен доступ до галереї");
                return;
            }

            const result = await launchImageLibraryAsync({
                mediaTypes: "images",
                allowsMultipleSelection: true,
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets?.length > 0) {
                const newImages = result.assets
                    .filter(asset => asset.base64)
                    .map(asset => `data:image/jpeg;base64,${asset.base64!}`);

                if (selectedImages.length + newImages.length > 5) {
                    Alert.alert("Ліміт зображень", "Можна вибрати не більше 5 зображень.");
                    return;
                }

                setSelectedImages(prev => [...prev, ...newImages]);
            }
        } catch (error) {
            console.log("Could not select image:", error);
            Alert.alert("Error", "Could not select image");
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const showFullScreenImage = (uri: string) => {
        setFullScreenImage(uri);
    };

    return (
        <View style={styles.container}>
            <View style={styles.chatHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                    <TouchableOpacity onPress={onBack}>
                        <BackArrowIcon style={{ width: 20, height: 20 }} />
                    </TouchableOpacity>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 15,
                            alignItems: "center",
                        }}
                    >
                        <Image
                            source={{ uri: API_BASE_URL + "/" + params.avatar }}
                            style={styles.avatar}
                        />
                        <View style={{}}>
                            <Text style={styles.chatName}>{params.name}</Text>
                            <Text style={styles.chatInfo}>@{params.username}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.menuBtn}
                    ref={dotsRef}
                    onPress={() => setModalVisible(true)}
                >
                    <Dots style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
                innerRef={ref => {
                    scrollViewRef.current = ref;
                }}
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === "ios" ? 80 : 0}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.messages}
                enableAutomaticScroll={false}
                extraHeight={20}
            >
                {messages.length === 0 ? (
                    <Text style={{ textAlign: "center", paddingTop: 10, color: "#543C52" }}>
                        Немає повідомлень!
                    </Text>
                ) : (
                    messages.map((msg, index) => {
                        const isMyMessage = msg.author_id === user?.id;
                        const showDate = shouldShowDate(msg, messages[index - 1]);

                        return (
                            <View key={index}>
                                {showDate && (
                                    <View style={{ alignItems: "center", marginVertical: 10 }}>
                                        <View style={styles.dateContainer}>
                                            <Text style={styles.chatDate}>
                                                {formatDate(new Date(msg.sent_at))}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                <View
                                    style={[
                                        styles.message,
                                        isMyMessage ? { justifyContent: "flex-end" } : {},
                                    ]}
                                >
                                    {!isMyMessage && (
                                        <Image
                                            source={{ uri: API_BASE_URL + "/" + params.avatar }}
                                            style={{ width: 40, height: 40, borderRadius: 12345 }}
                                        />
                                    )}
                                    <View
                                        style={
                                            isMyMessage
                                                ? styles.messageBubbleMy
                                                : styles.messageBubble
                                        }
                                    >
                                        {msg.attached_image && (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    showFullScreenImage(msg.attached_image)
                                                }
                                            >
                                                <Image
                                                    source={{ uri: msg.attached_image }}
                                                    style={[
                                                        styles.messageImage,
                                                        {
                                                            width: 150,
                                                            height: 150,
                                                            borderRadius: 8,
                                                        },
                                                    ]}
                                                    resizeMode="cover"
                                                />
                                            </TouchableOpacity>
                                        )}
                                        <Text style={styles.messageText}>{msg.content}</Text>
                                        <View style={styles.messageBox}>
                                            <Text style={styles.messageTime}>
                                                {new Date(msg.sent_at).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </Text>
                                            <CheckMarkIcon style={{ width: 10, height: 9 }} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </KeyboardAwareScrollView>

            {selectedImages.length > 0 && (
                <ScrollView
                    horizontal
                    style={styles.selectedImagesContainer}
                    showsHorizontalScrollIndicator={false}
                >
                    {selectedImages.map((img, index) => (
                        <View key={index} style={styles.previewImageWrapper}>
                            <Image
                                source={{ uri: img }}
                                style={styles.selectedImage}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                style={[
                                    styles.removeImageButton,
                                    {
                                        position: "absolute",
                                        top: -5,
                                        right: -5,
                                        backgroundColor: "#9c0a0aff",
                                        borderRadius: 12,
                                        width: 24,
                                        height: 24,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    },
                                ]}
                                onPress={() => removeImage(index)}
                            >
                                <Text
                                    style={[
                                        styles.removeImageText,
                                        { color: "#fff", fontSize: 16 },
                                    ]}
                                >
                                    ×
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}

            <View style={[styles.inputContainer, { paddingBottom: 10 }]}>
                <TextInput
                    style={[styles.input, { flex: 1, borderRadius: 20, paddingHorizontal: 15 }]}
                    placeholder="Повідомлення"
                    value={input}
                    onChangeText={setInput}
                />
                <TouchableOpacity
                    style={[styles.attachBtn, { padding: 10 }]}
                    onPress={pickImage}
                    disabled={isUploading}
                >
                    <Image
                        source={require("../../../../shared/ui/images/pictures-modal.png")}
                        style={{ width: 40, height: 40 }}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.sendBtn,
                        {
                            backgroundColor: isUploading ? "#ccc" : "#543C52",
                            borderRadius: 20,
                            padding: 10,
                        },
                    ]}
                    onPress={sendMessage}
                    disabled={isUploading}
                >
                    <SendArrow style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
            </View>

            <Modal
                visible={!!fullScreenImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setFullScreenImage(null)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.9)",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <TouchableOpacity
                        style={{
                            position: "absolute",
                            top: 40,
                            right: 20,
                            zIndex: 1000,
                        }}
                        onPress={() => setFullScreenImage(null)}
                    >
                        <Text style={{ color: "#fff", fontSize: 24 }}>×</Text>
                    </TouchableOpacity>
                    <Image
                        source={{ uri: fullScreenImage || "" }}
                        style={{
                            width: Dimensions.get("window").width,
                            height: Dimensions.get("window").height * 0.8,
                            resizeMode: "contain",
                        }}
                    />
                </View>
            </Modal>

            <ChatModalDelete
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                chat_id={parseInt(params.chat_id)}
                dotsPosition={dotsPosition}
                scrollOffset={scrollOffset}
                onMessagesDeleted={() => setMessages([])}
            />
        </View>
    );
}
