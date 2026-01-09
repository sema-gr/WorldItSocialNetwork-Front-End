import { ScrollView, View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { styles } from "./album.style";
import Dots from "../../../../shared/ui/icons/dots";
import { useEffect, useState, useRef } from "react";
import { LayoutChangeEvent } from "react-native";
import {
    launchImageLibraryAsync,
    MediaTypeOptions,
    requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IAlbum, IAlbumImageShow, IPutResponse } from "../../types/albums.types";
import { PUT } from "../../../../shared/api/put";
import { API_BASE_URL } from "../../../../settings";
import { ModalAlbum } from "../album-modal/album-modal";
import { useUserContext } from "../../../auth/context/user-context";

export function Album({ scrollOffset = 0, ...props }: IAlbum & { scrollOffset?: number }) {
    const [images, setImages] = useState<IAlbumImageShow[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [dotsPosition, setDotsPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const dotsRef = useRef<View>(null);
    const [imageDimensions, setImageDimensions] = useState<{
        [key: string]: { width: number; height: number };
    }>({});
    const [containerSize, setContainerSize] = useState({
        width: 400,
        height: 725,
    });
    const [tokenUser, setTokenUser] = useState<string>("");
    const { user } = useUserContext();
    const [isChange, setIsChange] = useState<boolean>(false);

    const getToken = async (): Promise<string> => {
        const token = await AsyncStorage.getItem("tokenStorage");
        return token || "";
    };

    useEffect(() => {
        getToken().then(setTokenUser);
        if (props.images && Array.isArray(props.images)) {
            setImages(
                props.images.map(image => ({
                    image: {
                        id: image.image.id,
                        filename: image.image.filename,
                        file: image.image.file,
                    },
                })),
            );
        }
    }, []);

    const measureDots = () => {
        if (dotsRef.current) {
            dotsRef.current.measureInWindow(
                (x: number, y: number, width: number, height: number) => {
                    setDotsPosition({ x, y });
                },
            );
        }
    };

    useEffect(() => {
        if (modalVisible) {
            measureDots();
        }
    }, [modalVisible, scrollOffset]);

    const handleContainerLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({ width, height });
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
                mediaTypes: MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                allowsEditing: false,
                base64: true,
            });

            if (!result.canceled && result.assets) {
                const allowedFormats = ["jpeg", "png", "gif"];
                const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

                const newImages: IAlbumImageShow[] = result.assets
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
                    .filter((img): img is IAlbumImageShow => img !== null);

                if (images.length + newImages.length > 10) {
                    Alert.alert("Увага", "Максимальна кількість зображень - 10");
                    return;
                }
                setIsChange(true);
                setImages(prev => [...prev, ...newImages]);
            } else if (result.canceled) {
                Alert.alert("Скасовано", "Вибір зображень було скасовано");
            }
        } catch (error) {
            Alert.alert(
                "Error",
                `Could not select image: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    function renderImages() {
        return (
            <View style={styles.imageGrid}>
                {images.map((img, idx) => {
                    const correctImage = img.image.filename.startsWith("data:image")
                        ? img.image.filename
                        : `${API_BASE_URL}/${img.image.filename.replace(/^\/+/, "")}`;
                    return (
                        <View key={img.image.id} style={styles.imageContainer}>
                            {correctImage.slice(-8) === "user.png" ? (
                                <Image
                                    source={require("../../../../shared/ui/images/user.png")}
                                    style={styles.imageAdded}
                                    resizeMode="cover"
                                    onError={error => {
                                        console.log(
                                            "Помилка завантаження зображення:",
                                            error.nativeEvent,
                                        );
                                        Alert.alert(
                                            "Помилка",
                                            "Не вдалося завантажити зображення.",
                                        );
                                    }}
                                />
                            ) : (
                                <Image
                                    source={{ uri: correctImage }}
                                    style={styles.imageAdded}
                                    resizeMode="cover"
                                    onError={error => {
                                        console.log(
                                            "Помилка завантаження зображення:",
                                            error.nativeEvent,
                                        );
                                        Alert.alert(
                                            "Помилка",
                                            "Не вдалося завантажити зображення.",
                                        );
                                    }}
                                />
                            )}
                            {user?.id === props.author_id ? (
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => deleteImage(img.image.id)}
                                >
                                    <Image
                                        source={require("../../../../shared/ui/images/trash.png")}
                                        style={{ width: 22, height: 22 }}
                                    />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    );
                })}
                {user?.id === props.author_id ? (
                    <>
                        {images.length < 10 && (
                            <TouchableOpacity style={styles.addImage} onPress={onSearch}>
                                <Image
                                    style={{ width: 40.6, height: 40 }}
                                    source={require("../../../../shared/ui/images/plus-in-circle.png")}
                                />
                            </TouchableOpacity>
                        )}
                    </>
                ) : null}
            </View>
        );
    }

    function deleteImage(id: number) {
        const imageToDelete = images.find(image => image.image.id === id);
        if (!imageToDelete) {
            Alert.alert("Помилка", "Зображення не знайдено");
            return;
        }

        if (!imageToDelete.image.filename.startsWith("data:image")) {
            setImagesToDelete(prev => [...prev, id]);
        }

        setImages(prev => prev.filter(image => image.image.id !== id));
        setImageDimensions(prev => {
            const updatedDimensions = { ...prev };
            delete updatedDimensions[id];
            return updatedDimensions;
        });
        setIsChange(true);
    }

    async function handleSubmit() {
        try {
            const formattedImages: IAlbumImageShow[] = [
                ...images,
                ...imagesToDelete.map(id => ({ image: { id: id, filename: "" } })),
            ];

            const response: IPutResponse = await PUT({
                endpoint: `${API_BASE_URL}/albums/${props.id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenUser}`,
                },
                token: tokenUser,
                body: {
                    images:
                        formattedImages.length > 0 || formattedImages.length > 0
                            ? formattedImages
                            : undefined,
                },
            });

            Alert.alert("Успіх", "Зміни успішно збережено");
            setImages(response.data?.images || []);
            setImagesToDelete([]);
            setIsChange(false);
        } catch (err) {
            console.log("Помилка збереження:", err);
            Alert.alert("Помилка", "Не вдалося зберегти зміни");
        }
    }

    return (
        <View style={styles.container} onLayout={handleContainerLayout}>
            <ScrollView contentContainerStyle={styles.scrollContainer} overScrollMode="never">
                <View
                    style={{
                        gap: 27,
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        alignContent: "center",
                    }}
                >
                    <View style={{ width: "100%" }}>
                        <View style={styles.mainBox}>
                            <Text style={styles.title}>{props.name}</Text>
                            {user?.id === props.author_id ? (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <Image
                                            source={require("../../../../shared/ui/images/eye-my-publication.png")}
                                            style={styles.actionIcon}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        ref={dotsRef}
                                        onPress={() => setModalVisible(true)}
                                        style={{ alignItems: "center", justifyContent: "center" }}
                                    >
                                        <Dots width={20} height={20} />
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </View>
                        <View style={styles.theme}>
                            <Text style={{ fontSize: 16 }}>
                                {props.topic.map(topic => topic.tag.name).join(", ") || "#моїфото"}
                            </Text>
                            <Text style={{ fontSize: 16, color: "#81818D" }}>
                                {props.created_at?.slice(0, 4)} рік
                            </Text>
                        </View>
                        <View style={styles.separator} />
                    </View>
                    <View
                        style={{
                            gap: 27,
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <Text style={styles.title}>Фотографії</Text>
                        <View style={styles.photoGrid}>{images ? renderImages() : null}</View>
                    </View>
                    {user?.id === props.author_id && isChange ? (
                        <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
                            <Text style={styles.submitText}>Зберегти</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </ScrollView>
            <ModalAlbum
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                albumId={props.id}
                dotsPosition={dotsPosition}
                containerSize={containerSize}
                scrollOffset={scrollOffset}
            />
        </View>
    );
}
