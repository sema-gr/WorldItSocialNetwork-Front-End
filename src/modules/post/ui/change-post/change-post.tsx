import React, { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
import { usePosts } from "../../hooks/use-get-post";
import { PUT } from "../../../../shared/api/put";
import Cross from "../../../../shared/ui/icons/cross";
import { Input } from "../../../../shared/ui/input";
import SendArrow from "../../../../shared/ui/icons/send-arrow";
import { styles } from "./change-post.styles";
import { IPost, IPostImg } from "../../types/post";
import { API_BASE_URL } from "../../../../settings";
import { Props, TagItem, UpdateData } from "./types";

export function ChangePostModal({ modalVisible, changeVisibility, postData }: Props) {
    const [name, setName] = useState("");
    const [theme, settheme] = useState("");
    const [text, setText] = useState("");
    const [images, setImages] = useState<IPostImg[]>([]);
    const [tokenUser, setTokenUser] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [links, setLinks] = useState<string[]>([""]);
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

    const { refresh } = usePosts();

    const isValidUrl = (url: string): boolean => {
        const urlPattern = /^(https?:\/\/)([\w.-]+)\.([a-z]{2,})(\/.*)?$/i;
        return urlPattern.test(url);
    };

    useEffect(() => {
        const loadData = async () => {
            const token = await AsyncStorage.getItem("token");
            setTokenUser(token || "");

            if (postData) {
                setName(postData.title || "");
                settheme(postData.theme || "");
                setText(postData.content || "");
                setLinks(
                    Array.isArray(postData.links)
                        ? postData.links.map(l =>
                              typeof l === "string"
                                  ? l
                                  : typeof l === "object" && l !== null && "url" in l
                                    ? l.url
                                    : "",
                          )
                        : postData.links
                          ? [postData.links]
                          : [""],
                );

                const tagsFromPost = Array.from(
                    new Set(
                        postData.tags
                            ?.map(tag => tag.tag.name)
                            .filter((tag): tag is string => tag !== null) || [],
                    ),
                );

                setValue(tagsFromPost);
                setImages(postData.images || []);

                const additionalTags = tagsFromPost
                    .filter(tag => !items.some(item => item.value === tag))
                    .map(tag => ({ label: tag, value: tag }));
                setItems(prev => [...prev, ...additionalTags]);
            }
        };

        if (modalVisible) {
            loadData();
        }
    }, [modalVisible]);

    const handleSubmit = async () => {
        if (!postData || !postData.id) {
            Alert.alert("Помилка", "Дані поста або ID поста відсутні");
            return;
        }

        const invalidLinks = links.filter(link => link.trim() !== "" && !isValidUrl(link.trim()));
        if (invalidLinks.length > 0) {
            Alert.alert("Помилка", "Будь ласка, введіть коректні посилання");
            return;
        }

        if (value.length > 10) {
            Alert.alert("Помилка", "Максимум 10 тегів");
            return;
        }

        const sanitizedTags = value
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0 && tag.length <= 50);

        if (sanitizedTags.length !== value.length) {
            Alert.alert("Помилка", "Теги повинні бути не довшими за 50 символів");
            return;
        }

        const formattedLinks = links
            .filter(link => link.trim() !== "")
            .filter(isValidUrl)
            .join(",");

        const updatedData: UpdateData = {
            title: name.trim(),
            theme: theme.trim(),
            content: text.trim(),
            links: formattedLinks || undefined,
            tags: sanitizedTags,
        };

        const existingImages = postData.images || [];

        const remainingImages = images.filter(img =>
            existingImages.some(ei => ei.image.id === img.image.id),
        );

        const newImages = images
            .filter(img => img.image.filename.startsWith("data:image"))
            .map(img => {
                try {
                    const matches = img.image.filename.match(/^data:image\/(\w+);base64,(.+)$/);
                    if (!matches || !["jpeg", "png", "gif"].includes(matches[1].toLowerCase())) {
                        return null;
                    }

                    const base64Data = matches[2];
                    const estimatedSize = (base64Data.length * 3) / 4;
                    if (estimatedSize > 5 * 1024 * 1024) {
                        return null;
                    }

                    return { url: img.image.filename };
                } catch (error) {
                    console.log("Error:", error);
                    return null;
                }
            })
            .filter((img): img is { url: string } => img !== null);

        const deletedImages = existingImages
            .filter(ei => !images.some(img => img.image.id === ei.image.id))
            .map(ei => ({ id: ei.image.id }));

        if (remainingImages.length + newImages.length > 10) {
            Alert.alert("Помилка", "Максимум 10 зображень дозволено");
            return;
        }

        if (newImages.length > 0 || deletedImages.length > 0) {
            updatedData.images = [...newImages, ...deletedImages];
        }

        setIsLoading(true);

        try {
            const response = await PUT<IPost>({
                endpoint: `${API_BASE_URL}/posts/${postData.id}`,
                headers: {
                    "Content-Type": "application/json",
                },
                token: tokenUser,
                body: updatedData,
            });

            if (response.status === "success") {
                Alert.alert("Успіх", "Пост успішно оновлено");
                refresh();
                changeVisibility();
            } else {
                Alert.alert("Помилка", response.message || "Не вдалося оновити пост");
            }
        } catch (error) {
            console.log("Error update post:", error);
            Alert.alert(
                "Помилка",
                error instanceof Error ? error.message : "Не вдалося оновити пост",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkChange = (text: string, index: number) => {
        const newLinks = [...links];
        newLinks[index] = text;
        setLinks(newLinks);
    };

    const removeLinksInput = (index: number) => {
        if (links.length > 1) {
            const newLinks = [...links];
            newLinks.splice(index, 1);
            setLinks(newLinks);
        }
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
                const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

                const newImages: IPostImg[] = result.assets
                    .map((asset, index) => {
                        if (!asset.mimeType || !asset.base64) {
                            Alert.alert(
                                "Помилка",
                                "Вибране зображення не підтримується або не містить даних.",
                            );
                            return null;
                        }
                        const type = asset.mimeType.split("/")[1]?.toLowerCase();
                        if (!allowedFormats.includes(type)) {
                            Alert.alert(
                                "Помилка",
                                `Формат зображення ${type} не підтримується. Дозволені формати: ${allowedFormats.join(", ")}.`,
                            );
                            return null;
                        }
                        const base64String = asset.base64;
                        const estimatedSizeInBytes = (base64String.length * 3) / 4;
                        if (estimatedSizeInBytes > maxSizeInBytes) {
                            Alert.alert(
                                "Помилка",
                                `Зображення занадто велике. Максимальний розмір: ${maxSizeInBytes / (1024 * 1024)} MB`,
                            );
                            return null;
                        }
                        const url = `data:image/${type};base64,${base64String}`;

                        return {
                            image: {
                                id: Date.now() + index,
                                filename: url,
                            },
                        };
                    })
                    .filter((img): img is IPostImg => img !== null);

                if (images.length + newImages.length > 10) {
                    Alert.alert("Увага", "Максимальна кількість зображень - 10");
                    return;
                }

                setImages(prev => [...prev, ...newImages]);
            } else if (result.canceled) {
                Alert.alert("Скасовано", "Вибір зображень було скасовано");
            }
        } catch (error) {
            Alert.alert(
                "Помилка",
                `Не вдалося вибрати зображення: ${error instanceof Error ? error.message : "Невідома помилка"}`,
            );
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const addLinksInput = () => {
        if (links.length < 5) {
            setLinks([...links, ""]);
        } else {
            Alert.alert("Увага", "Максимальна кількість посилань - 5");
        }
    };

    function renderImages() {
        if (images.length === 0) {
            return <Text style={styles.noImagesText}>Додайте зображення</Text>;
        }

        return (
            <View style={styles.imageGrid}>
                {images.map((img, idx) => {
                    const correctImage = img.image.filename.startsWith("data:image")
                        ? img.image.filename
                        : `${API_BASE_URL}/${img.image.filename.replace(/^\/+/, "")}`; // Видаляємо зайві слеші

                    return (
                        <View key={`image-${img.image.id}-${idx}`} style={styles.imageContainer}>
                            <Image
                                source={{ uri: correctImage }}
                                style={styles.imageAdded}
                                resizeMode="cover"
                                onError={error => {
                                    console.log(
                                        "Помилка завантаження зображення:",
                                        error.nativeEvent,
                                    );
                                    Alert.alert("Помилка", "Не вдалося завантажити зображення.");
                                }}
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => removeImage(idx)}
                            >
                                <Image
                                    source={require("../../../../shared/ui/images/trash.png")}
                                    style={{ width: 22, height: 22 }}
                                />
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    }

    if (!postData) {
        return null;
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={changeVisibility}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Редагувати публікацію</Text>
                        <Pressable onPress={changeVisibility}>
                            <Cross style={{ width: 15, height: 15 }} />
                        </Pressable>
                    </View>

                    <ScrollView
                        overScrollMode="never"
                        style={styles.scrollArea}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={{ gap: 15, alignItems: "center", justifyContent: "center" }}>
                            <Input
                                label="Назва"
                                placeholder="Введіть назву публікації"
                                value={name}
                                onChangeText={setName}
                                maxLength={100}
                                style={{ width: "100%" }}
                            />
                            <Input
                                label="Тема"
                                placeholder="Введіть тему публікації"
                                value={theme}
                                onChangeText={settheme}
                                maxLength={60}
                                style={{ width: "100%" }}
                            />
                            <TextInput
                                style={{
                                    width: "100%",
                                    minHeight: 120,
                                    minWidth: "90%",
                                    maxWidth: "90%",
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: "#CDCED2",
                                    borderRadius: 10,
                                    fontSize: 16,
                                    backgroundColor: "#f9f9f9",
                                }}
                                placeholder="Опис публікації"
                                value={text}
                                onChangeText={setText}
                                multiline
                                textAlignVertical="top"
                                maxLength={2000}
                            />
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
                                        backgroundColor: "#E9E5EE",
                                        padding: 4,
                                        borderRadius: 8,
                                        minHeight: 20,
                                    }}
                                    placeholder="Оберіть або додайте теги"
                                    searchable={true}
                                    searchPlaceholder="Пошук або створення тегу..."
                                    listMode="SCROLLVIEW"
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
                                    onChangeValue={() => {}}
                                    onChangeSearchText={text => {
                                        const sanitizedText = text.trim();
                                        if (
                                            sanitizedText &&
                                            !items.some(item => item.value === sanitizedText) &&
                                            sanitizedText.length <= 50
                                        ) {
                                            setItems(prev => [
                                                ...prev,
                                                { label: sanitizedText, value: sanitizedText },
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
                                        <Text style={{ color: "#543C52", fontSize: 14 }}>
                                            {tag}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                setValue(prev => prev.filter((_, i) => i !== index))
                                            }
                                        >
                                            <Text style={{ color: "#543C52", fontSize: 14 }}>
                                                ×
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: "600",
                                marginTop: 20,
                                marginBottom: 10,
                                color: "#333",
                            }}
                        >
                            Зображення ({images.length}/10)
                        </Text>
                        {renderImages()}

                        <View
                            style={{
                                marginTop: 20,
                                gap: 10,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "flex-end",
                            }}
                        >
                            <TouchableOpacity onPress={onSearch}>
                                <Image
                                    source={require("../../../../shared/ui/images/pictures-modal.png")}
                                    style={styles.icon}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image
                                    source={require("../../../../shared/ui/images/smile-modal.png")}
                                    style={styles.icon}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text
                                            style={{
                                                color: "white",
                                                fontWeight: "500",
                                                fontSize: 14,
                                            }}
                                        >
                                            Оновити публікацію
                                        </Text>
                                        <SendArrow style={{ width: 20, height: 20 }} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
