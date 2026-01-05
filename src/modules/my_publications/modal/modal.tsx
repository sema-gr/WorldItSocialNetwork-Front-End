import React, { useState } from "react";
import {
    Modal,
    Pressable,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    Alert,
} from "react-native";
import Cross from "../../../shared/ui/icons/cross";
import SendArrow from "../../../shared/ui/icons/send-arrow";
import { Input } from "../../../shared/ui/input";
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from "expo-image-picker";
import { POST } from "../../../shared/api/post";
import { useUserContext } from "../../auth/context/user-context";
import DropDownPicker from "react-native-dropdown-picker";
import { API_BASE_URL } from "../../../settings";

interface Props {
    modalVisible: boolean;
    changeVisibility: () => void;
}

interface TagItem {
    label: string;
    value: string;
}

interface IPostImg {
    id: number;
    url: string;
    userPostId: number;
}

export function MyPublicationModal({ modalVisible, changeVisibility }: Props) {
    const [name, setName] = useState("");
    const [theme, setTheme] = useState("");
    const [text, setText] = useState("");
    const [links, setLinks] = useState<string[]>([""]);
    const [images, setImages] = useState<IPostImg[]>([]);
    const [tokenUser] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUserContext();
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string[]>([]);
    const [items, setItems] = useState<TagItem[]>([
        { label: "Відпочинок", value: "#відпочинок" },
        { label: "Натхнення", value: "#натхнення" },
        { label: "Життя", value: "#життя" },
        { label: "Природа", value: "#природа" },
        { label: "Спокій", value: "#спокій" },
        { label: "Читання", value: "#читання" },
        { label: "Гармонія", value: "#гармонія" },
        { label: "Музика", value: "#музика" },
        { label: "Фільми", value: "#фільми" },
        { label: "Подорожі", value: "#подорожі" },
    ]);

    const handleSubmit = async () => {
        if (!name.trim() || !theme.trim() || !text.trim()) {
            Alert.alert("Помилка", "Будь ласка, заповніть усі обов'язкові поля");
            return;
        }
        if (!user) {
            Alert.alert("Упс...", "Схоже, ви не авторизовані 😞, тому не можете створити пост 🙄");
            return;
        }
        if (value.length > 10) {
            Alert.alert("Помилка", "Максимум 10 тегів");
            return;
        }

        // Validate all links
        const invalidLinks = links.filter(link => link.trim() !== "" && !isValidUrl(link.trim()));
        if (invalidLinks.length > 0) {
            Alert.alert("Помилка", "Будь ласка, введіть коректні посилання");
            return;
        }

        const sanitizedTags = value
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0 && tag.length <= 50);

        if (sanitizedTags.length !== value.length) {
            Alert.alert("Помилка", "Теги мають бути не довшими за 50 символів");
            return;
        }

        const formattedImages =
            images.length > 0 ? images.map(img => ({ url: img.url })) : undefined;

        const nonEmptyLinks = links.filter(link => link.trim() !== "");
        let correctLinks = "";

        nonEmptyLinks.forEach((link, index) => {
            link = link.trim();
            if (isValidUrl(link)) {
                correctLinks += link + (index < nonEmptyLinks.length - 1 ? "," : "");
            }
        });

        setIsLoading(true);
        console.log(theme);
        try {
            const response = await POST({
                endpoint: `${API_BASE_URL}/posts/create`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenUser}`,
                },
                token: tokenUser,
                body: {
                    title: name.trim(),
                    theme: theme.trim(),
                    content: text.trim(),
                    links: correctLinks ? correctLinks : undefined,
                    tags: sanitizedTags.length > 0 ? sanitizedTags : undefined,
                    images: formattedImages,
                    author_id: user.id,
                },
            });
            if (response.status === "success") {
                setName("");
                setTheme("");
                setText("");
                setLinks([""]);
                setImages([]);
                setValue([]);
                setItems([
                    { label: "Відпочинок", value: "#відпочинок" },
                    { label: "Натхнення", value: "#натхнення" },
                    { label: "Життя", value: "#життя" },
                    { label: "Природа", value: "#природа" },
                    { label: "Спокій", value: "#спокій" },
                    { label: "Читання", value: "#читання" },
                    { label: "Гармонія", value: "#гармонія" },
                    { label: "Музика", value: "#музика" },
                    { label: "Фільми", value: "#фільми" },
                    { label: "Подорожі", value: "#подорожі" },
                ]);
                changeVisibility();
                Alert.alert("Успіх", "Публікацію успішно створено");
            }
        } catch (err) {
            console.log("[refetch] Ошибка в процессе создания поста:", err);
            Alert.alert(
                "Помилка",
                `Не вдалося створити публікацію: ${
                    err instanceof Error ? err.message : "Невідома помилка"
                }`,
            );
        } finally {
            Alert.alert("Успіх", "Публікацію успішно створено");
            setName("");
            setTheme("");
            setText("");
            setLinks([""]);
            setImages([]);
            setValue([]);
            setItems([
                { label: "Відпочинок", value: "#відпочинок" },
                { label: "Натхнення", value: "#натхнення" },
                { label: "Життя", value: "#життя" },
                { label: "Природа", value: "#природа" },
                { label: "Спокій", value: "#спокій" },
                { label: "Читання", value: "#читання" },
                { label: "Гармонія", value: "#гармонія" },
                { label: "Музика", value: "#музика" },
                { label: "Фільми", value: "#фільми" },
                { label: "Подорожі", value: "#подорожі" },
            ]);
            changeVisibility();
            setIsLoading(false);
        }
    };

    const addLinksInput = () => {
        if (links.length < 5) {
            setLinks([...links, ""]);
        } else {
            Alert.alert("Увага", "Максимальна кількість посилань - 5");
        }
    };

    const removeLinksInput = (index: number) => {
        if (links.length > 1) {
            const newLinks = [...links];
            newLinks.splice(index, 1);
            setLinks(newLinks);
        }
    };

    const handleLinkChange = (text: string, index: number) => {
        const newLinks = [...links];
        newLinks[index] = text;
        setLinks(newLinks);
    };

    async function onSearch() {
        try {
            const { status } = await requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Дозвіл не надано",
                    "Для додавання зображень необхідно надати доступ до галереї",
                );
                return;
            }

            const result = await launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: true,
                quality: 0.8,
                allowsEditing: false,
                base64: true,
            });

            if (!result.canceled && result.assets) {
                const allowedFormats = ["jpeg", "png", "gif"];
                const maxSizeInBytes = 5 * 1024 * 1024;

                const newImages = await Promise.all(
                    result.assets
                        .filter(asset => {
                            const type = asset.mimeType?.split("/")[1]?.toLowerCase() || "";
                            return asset.base64 && allowedFormats.includes(type);
                        })
                        .map(async (asset, index) => {
                            const base64String = asset.base64!;
                            const estimatedSizeInBytes = (base64String.length * 3) / 4;
                            if (estimatedSizeInBytes > maxSizeInBytes) {
                                Alert.alert("Помилка", `Зображення занадто велике (макс. 5 МБ)`);
                                return null;
                            }
                            const imageUrl = `data:image/${
                                asset.mimeType?.split("/")[1] || "jpeg"
                            };base64,${base64String}`;

                            return {
                                id: Date.now() + index,
                                url: imageUrl,
                                userPostId: 0,
                            };
                        }),
                );

                const filteredImages = newImages.filter((img): img is IPostImg => img !== null);

                if (images.length + filteredImages.length > 10) {
                    Alert.alert("Увага", "Максимальна кількість зображень - 10");
                    return;
                }

                setImages(prev => [...prev, ...filteredImages]);
            } else if (result.canceled) {
                Alert.alert("Скасовано", "Вибір зображень було скасовано");
            }
        } catch (error) {
            console.log("[MyPublicationModal] Error select photo:", error);
            Alert.alert(
                "Помилка",
                `Не вдалося вибрати зображення: ${
                    error instanceof Error ? error.message : "Невідома помилка"
                }`,
            );
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const isValidUrl = (url: string): boolean => {
        if (url.trim() === "") return true;
        const urlPattern = /^(https?:\/\/)([\w.-]+)\.([a-z]{2,})(\/.*)?$/i;
        return urlPattern.test(url);
    };

    const renderImages = () => {
        if (images.length === 0) {
            return <Text style={styles.noImagesText}>Додайте зображення</Text>;
        }

        return (
            <View style={styles.imageGrid}>
                {images.map((img, idx) => {
                    const isValidImage =
                        img.url.startsWith("data:image/") || img.url.startsWith("http");
                    if (!isValidImage) {
                        console.log(`[ChangePostModal] Некоректний URL зображення: ${img.url}`);
                        return null;
                    }
                    return (
                        <View key={`image-${img.id}-${idx}`} style={styles.imageContainer}>
                            <Image
                                source={{ uri: img.url }}
                                style={styles.imageAdded}
                                resizeMode="cover"
                                onError={e => {
                                    console.log(
                                        `[ChangePostModal] Помилка завантаження зображення: ${img.url}`,
                                        e.nativeEvent,
                                    );
                                }}
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => removeImage(idx)}
                            >
                                <Image
                                    source={require("../../../shared/ui/images/trash.png")}
                                    width={20}
                                    height={20}
                                    style={{
                                        width: 22,
                                        height: 22,
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={changeVisibility}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Створення публікації</Text>
                        <Pressable onPress={changeVisibility}>
                            <Cross style={{ width: 15, height: 15 }} />
                        </Pressable>
                    </View>
                    <ScrollView
                        overScrollMode="never"
                        style={styles.scrollArea}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.form}>
                            <Input
                                style={{ width: "100%" }}
                                label="Назва публікації"
                                placeholder="Напишіть назву публікації"
                                value={name}
                                onChangeText={setName}
                                maxLength={100}
                            />
                            <Input
                                style={{ width: "100%" }}
                                label="Тема публікації"
                                placeholder="Напишіть тему публікації"
                                value={theme}
                                onChangeText={setTheme}
                                maxLength={60}
                            />
                            <View>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Введіть опис публікації"
                                    value={text}
                                    onChangeText={setText}
                                    multiline
                                    maxLength={2000}
                                    textAlignVertical="top"
                                    autoCapitalize="sentences"
                                />
                            </View>

                            <View style={{ width: "90%", marginTop: 10 }}>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: "600",
                                        color: "#333",
                                        marginBottom: 8,
                                    }}
                                >
                                    Посилання
                                </Text>

                                {links.map((link, index) => (
                                    <View
                                        key={`link-${index}`}
                                        style={{
                                            marginBottom: 10,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <TextInput
                                            style={{
                                                flex: 1,
                                                borderWidth: 1,
                                                borderColor: "#CDCED2",
                                                borderRadius: 10,
                                                padding: 12,
                                                backgroundColor: "#f9f9f9",
                                                fontSize: 16,
                                            }}
                                            placeholder="Введіть посилання..."
                                            value={link}
                                            onChangeText={text => handleLinkChange(text, index)}
                                            keyboardType="url"
                                        />

                                        {links.length > 1 && (
                                            <TouchableOpacity
                                                onPress={() => removeLinksInput(index)}
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    backgroundColor: "#E9E5EE",
                                                    borderRadius: 15,
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Text style={{ color: "#543C52", fontSize: 18 }}>
                                                    ×
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}

                                {links.length < 5 && (
                                    <TouchableOpacity
                                        onPress={addLinksInput}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            marginTop: 5,
                                            paddingVertical: 8,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 30,
                                                height: 30,
                                                backgroundColor: "#E9E5EE",
                                                borderRadius: 15,
                                                justifyContent: "center",
                                                alignItems: "center",
                                                marginRight: 10,
                                            }}
                                        >
                                            <Text style={{ color: "#543C52", fontSize: 18 }}>
                                                +
                                            </Text>
                                        </View>
                                        <Text style={{ color: "#543C52", fontSize: 16 }}>
                                            Додати посилання
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={{ width: "90%", zIndex: 1000 }}>
                                <DropDownPicker
                                    open={open}
                                    value={value}
                                    items={items}
                                    setOpen={setOpen}
                                    setValue={setValue}
                                    setItems={setItems}
                                    multiple={true}
                                    min={0}
                                    max={10}
                                    mode="BADGE"
                                    badgeDotColors={["#543C52"]}
                                    badgeStyle={{
                                        padding: 4,
                                        borderRadius: 8,
                                        minHeight: 20,
                                    }}
                                    placeholder="Оберіть або додайте теги"
                                    searchable={true}
                                    searchPlaceholder="Пошук або створення тегу..."
                                    listMode="MODAL"
                                    scrollViewProps={{
                                        nestedScrollEnabled: true,
                                    }}
                                    addCustomItem={true}
                                    maxHeight={200}
                                    zIndex={1000}
                                    dropDownContainerStyle={{
                                        maxHeight: 250,
                                        borderColor: "#543C52",
                                        zIndex: 1000,
                                        flex: 1,
                                    }}
                                    onChangeSearchText={text => {
                                        const sanitizedText = text.trim();
                                        if (
                                            sanitizedText &&
                                            !items.some(item => item.value === sanitizedText) &&
                                            sanitizedText.length <= 50
                                        ) {
                                            setItems(prev => [
                                                ...prev,
                                                {
                                                    label: sanitizedText,
                                                    value: sanitizedText,
                                                },
                                            ]);
                                        }
                                    }}
                                />
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    gap: 8,
                                    marginTop: 5,
                                }}
                            >
                                {value.map((tag, index) => (
                                    <View
                                        key={`${tag}-${index}`}
                                        style={{
                                            backgroundColor: "#E9E5EE",
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            borderRadius: 15,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: "#543C52",
                                                fontSize: 14,
                                            }}
                                        >
                                            {tag}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                setValue(prev => prev.filter((_, i) => i !== index))
                                            }
                                        >
                                            <Text
                                                style={{
                                                    color: "#543C52",
                                                    fontSize: 14,
                                                }}
                                            >
                                                ×
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <Text style={styles.imageSectionTitle}>
                            Зображення ({images.length}/10)
                        </Text>
                        {renderImages()}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={{
                                    alignItems: "center",
                                }}
                                onPress={onSearch}
                            >
                                <Image
                                    source={require("../../../shared/ui/images/pictures-modal.png")}
                                    style={styles.icon}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image
                                    source={require("../../../shared/ui/images/smile-modal.png")}
                                    style={styles.icon}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                <>
                                    <Text style={styles.submitText}>Публікація</Text>
                                    <SendArrow style={{ width: 20, height: 20 }} />
                                </>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
        width: "100%",
        maxHeight: "80%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "500",
        color: "#070A1C",
    },
    form: {
        width: "100%",
        gap: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    textArea: {
        minHeight: 120,
        minWidth: "90%",
        maxWidth: "90%",
        width: "100%",
        padding: 16,
        borderWidth: 1,
        borderColor: "#CDCED2",
        borderRadius: 10,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    actions: {
        gap: 16,
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    addImageButton: {
        backgroundColor: "#f0f0f0",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    addImageText: {
        color: "#333",
        fontWeight: "500",
        fontSize: 16,
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#543C52",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 1234,
        gap: 8,
        minWidth: 130,
    },
    submitText: {
        color: "white",
        fontSize: 14,
        fontWeight: "500",
        flexShrink: 1,
    },
    scrollArea: {
        flexGrow: 1,
    },
    imageGrid: {
        flexDirection: "column",
        gap: 8,
    },
    imageContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    imageAdded: {
        width: "100%",
        height: 225,
        borderRadius: 16,
    },
    removeImageButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "white",
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#543C52",
    },
    noImagesText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginVertical: 10,
    },
    imageSectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 10,
        color: "#333",
    },
    selectedTagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        gap: 8,
    },
    tag: {
        backgroundColor: "#EEE",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    tagText: {
        color: "#333",
        fontSize: 14,
    },
    removeTagText: {
        color: "#333",
        fontSize: 14,
    },
    icon: {
        width: 40,
        height: 40,
    },
});
