import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Input } from "../../../../shared/ui/input";
import { styles } from "./add-album-modal.styles";
import { POST } from "../../../../shared/api/post";
import { API_BASE_URL } from "../../../../settings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserContext } from "../../../auth/context/user-context";
import { useAlbums } from "../../hooks/useAlbums";
import { IAlbumTheme } from "../../types/albums.types";

interface Props {
    modalVisible: boolean;
    onClose: () => void;
    changeVisibility: () => void;
}

export function AddAlbumModal({ modalVisible, onClose }: Props) {
    const [name, setName] = useState("");
    const [theme, setTheme] = useState<string>();
    const { user } = useUserContext();
    const [openTheme, setOpenTheme] = useState(false);
    const { refetch } = useAlbums();
    const [themeItems, setThemeItems] = useState<IAlbumTheme[]>([
        { label: "#Відпочинок", value: "#відпочинок" },
        { label: "#Натхнення", value: "#натхнення" },
        { label: "#Життя", value: "#життя" },
        { label: "#Природа", value: "#природа" },
        { label: "#Спокій", value: "#спокій" },
        { label: "#Читання", value: "#читання" },
        { label: "#Гармонія", value: "#гармонія" },
        { label: "#Музика", value: "#музика" },
        { label: "#Фільми", value: "#фільми" },
        { label: "#Подорожі", value: "#подорожі" },
    ]);

    const resetForm = () => {
        setName("");
        setTheme(undefined);
    };

    const handleSubmit = async () => {
        if (!name || !theme) {
            Alert.alert("Помилка", "Будь ласка, заповніть обов'язкові поля");
            return;
        }

        if (!user) {
            Alert.alert("Помилка", "Користувач не авторизований");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Помилка", "Користувач не авторизований");
                return;
            }

            const response = await POST({
                endpoint: `${API_BASE_URL}/albums/create`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                token: token,
                body: {
                    name: name,
                    topic: [theme],
                },
            });
            if (response.status === "error") {
                Alert.alert("Error", "Album creation failed: " + response.message);
            }
            Alert.alert("Успіх", "Альбом успішно створено!");
            onClose();
            resetForm();
            await refetch();
        } catch (err) {
            console.log("Error creating album:", err);
            Alert.alert("Помилка", "Сталася помилка при створенні альбому");
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleCancel}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Створити альбом</Text>
                    </View>

                    <ScrollView style={styles.scrollArea} overScrollMode="never">
                        <View style={styles.form}>
                            <Input
                                label="Назва альбому"
                                placeholder="Назва альбому"
                                value={name}
                                onChangeText={setName}
                                width={320}
                            />

                            <View style={{ width: "100%", zIndex: 2000, marginTop: 10 }}>
                                <DropDownPicker
                                    open={openTheme}
                                    value={theme || null}
                                    items={themeItems}
                                    setOpen={setOpenTheme}
                                    setValue={setTheme}
                                    setItems={setThemeItems}
                                    placeholder="Оберіть тему"
                                    searchable={true}
                                    searchPlaceholder="Пошук теми..."
                                    listMode="MODAL"
                                    scrollViewProps={{
                                        nestedScrollEnabled: true,
                                    }}
                                    addCustomItem={true}
                                    maxHeight={200}
                                    zIndex={2000}
                                    dropDownContainerStyle={{
                                        maxHeight: 250,
                                        borderColor: "#543C52",
                                        zIndex: 2000,
                                    }}
                                />
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <View style={styles.iconRow}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.submitTextCancel}>Скасувати</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                                    <Text style={styles.submitText}>Зберегти</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
