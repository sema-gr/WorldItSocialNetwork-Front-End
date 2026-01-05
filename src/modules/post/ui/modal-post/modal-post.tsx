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
import Pencil from "../../../../shared/ui/icons/pencil";
import Dots from "../../../../shared/ui/icons/dots";
import { useState, useEffect } from "react";
import { styles } from "./modal-post.style";
import { ChangePostModal } from "../change-post/change-post";
import { DELETE } from "../../../../shared/api/delete";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePosts } from "../../hooks/use-get-post";
import { IPost } from "../../types/post";
import { API_BASE_URL } from "../../../../settings";

interface ModalPostProps {
    visible: boolean;
    onClose: () => void;
    post_id: number;
    dotsPosition: { x: number; y: number };
    containerSize: { width: number; height: number };
    scrollOffset?: number;
    initialPosition?: { x: number; y: number };
}

export function ModalPost({
    visible,
    onClose,
    post_id,
    dotsPosition,
    scrollOffset = 0,
}: ModalPostProps) {
    const [modalOpened, setModalOpened] = useState<boolean>(false);
    const [tokenUser, setTokenUser] = useState<string | null>(null);
    const { posts, setPosts, refresh, isLoading } = usePosts();

    const getToken = async (): Promise<string | null> => {
        return await AsyncStorage.getItem("token");
    };

    useEffect(() => {
        getToken().then(setTokenUser);
    }, []);

    const modalWidth = 343;
    const modalHeight = 140;
    const { height: screenHeight } = Dimensions.get("window");

    const adjustedX = Math.max(0, dotsPosition?.x ? dotsPosition.x - modalWidth + 145 : 0);
    const adjustedY = dotsPosition?.y ? dotsPosition.y - scrollOffset - 5 : 0;
    const clampedY = Math.min(Math.max(adjustedY, 0), screenHeight - modalHeight);

    async function handleDelete(postId: number) {
        if (!tokenUser) {
            console.log("No token found");
            return;
        }
        try {
            await DELETE({
                endpoint: `${API_BASE_URL}/posts/${postId}`,
                headers: {
                    "Content-Type": "application/json",
                },
                token: tokenUser,
            });
            setPosts(posts.filter((post: IPost) => post.id !== postId));
            onClose();
            Alert.alert("Успіх", "Публікацію успішно видалено");
        } catch (error) {
            if (error instanceof Error) console.log("Помилка видалення:", error.message);
        }
    }

    const currentPost = posts.find((post: IPost) => post.id === post_id);

    if (!currentPost) {
        return null;
    }

    {
        isLoading && <ActivityIndicator />;
    }

    return (
        <>
            {modalOpened && (
                <ChangePostModal
                    modalVisible={modalOpened}
                    postData={{
                        id: post_id,
                        title: currentPost.title || "",
                        theme: currentPost.theme || "",
                        content: currentPost.content || "",
                        links: currentPost.links || [],
                        images: currentPost.images || [],
                        tags: currentPost.tags || [],
                        author_id: currentPost.author_id || 0,
                        views: currentPost.views || null,
                        likes: currentPost.likes || null,
                    }}
                    changeVisibility={() => setModalOpened(false)}
                />
            )}
            <Modal
                transparent={true}
                animationType="fade"
                visible={visible && !modalOpened}
                onRequestClose={onClose}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                    <View
                        style={[
                            styles.modalContainer,
                            {
                                position: "absolute",
                                top: clampedY,
                                left: adjustedX,
                            },
                        ]}
                    >
                        <View style={styles.dotsContainer}>
                            <Dots style={styles.dotsIcon} />
                        </View>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setModalOpened(true);
                                onClose();
                            }}
                        >
                            <Pencil style={styles.icon} />
                            <Text style={styles.optionText}>Редагувати допис</Text>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleDelete(post_id)}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Image
                                        source={require("../../../../shared/ui/images/trash.png")}
                                        style={{ width: 20, height: 24 }}
                                    />
                                    <Text style={[styles.optionText, styles.deleteText]}>
                                        Видалити публікацію
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}
