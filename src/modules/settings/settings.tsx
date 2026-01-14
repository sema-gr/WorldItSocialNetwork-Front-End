import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    Pressable,
    Platform,
} from "react-native";
import { Input } from "../../shared/ui/input";
import { styles } from "./settings.styles";
import { useUserContext } from "../auth/context/user-context";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { SignaturePadRef } from "./signature/signature";
import PencilIcon from "../../shared/ui/icons/pencil";
import { Controller, useForm } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from "expo-image-picker";
import { API_BASE_URL } from "../../settings";
import { IUserForm } from "./types";

export function Settings() {
    const { control, handleSubmit, reset } = useForm<IUserForm>({
        defaultValues: {
            dateOfBirth: new Date(),
            image: "",
        },
    });
    const { user, refreshUser } = useUserContext();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditing2, setIsEditing2] = useState(false);
    const router = useRouter();
    const [isDrawing, setIsDrawing] = useState(false);
    const signatureRef = useRef<SignaturePadRef>(null);

    function handleEditToggle() {
        setIsEditing(!isEditing);
    }

    async function handleSave(data: IUserForm) {
        if (!user) return;

        const isImageChanged = data.image !== `${API_BASE_URL}/${user.image}`;

        const body: IUserForm = {
            name: data.name,
            username: data.username,
            surname: data.surname,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
            email: data.email,
            signature: data.signature,
            image: isImageChanged ? data.image : user.image,
        };

        if (data.oldPassword && data.newPassword) {
            body.oldPassword = data.oldPassword;
            body.newPassword = data.newPassword;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (result.status === "error") {
                Alert.alert("Помилка", result.message);
                return;
            }

            Alert.alert("Успіх", "Дані успішно збережено");

            setIsEditing(false);
            setIsEditing2(false);

            reset({
                ...data,
                oldPassword: "",
                newPassword: "",
            });
        } catch {
            Alert.alert("Помилка", "Не вдалося зберегти дані");
        }
        refreshUser();
    }

    function handleEditToggle2() {
        setIsEditing2(!isEditing2);
    }

    function handlePress() {
        router.navigate("/registration/step-one");
    }

    useEffect(() => {
        async function loadData() {
            if (user) {
                reset({
                    name: user.name || "",
                    username: user.username || "",
                    surname: user.surname || "",
                    dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth) : new Date(),
                    email: user.email || "",
                    oldPassword: "",
                    newPassword: "",
                    signature: user.signature || "",
                    image: user.image ? `${API_BASE_URL}/${user.image}` : "",
                });
            }
        }
        loadData();
    }, [user, reset]);

    async function onSearch(): Promise<string | null> {
        try {
            const { status } = await requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Дозвіл не надано",
                    "Для додавання зображення необхідно надати доступ до галереї",
                );
                return null;
            }

            const result = await launchImageLibraryAsync({
                mediaTypes: ["images"],
                quality: 0.8,
                allowsEditing: false,
                base64: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                Alert.alert("Скасовано", "Вибір зображення було скасовано");
                return null;
            }

            const asset = result.assets[0];
            const allowedFormats = ["jpeg", "png", "gif"];
            const maxSizeInBytes = 5 * 1024 * 1024;
            const type = asset.mimeType?.split("/")[1]?.toLowerCase() || "";

            if (!asset.base64 || !allowedFormats.includes(type)) {
                Alert.alert("Помилка", "Непідтримуваний формат зображення");
                return null;
            }

            const estimatedSizeInBytes = (asset.base64.length * 3) / 4;
            if (estimatedSizeInBytes > maxSizeInBytes) {
                Alert.alert("Помилка", "Зображення занадто велике (макс. 5 МБ)");
                return null;
            }

            const imageUrl = `data:image/${type};base64,${asset.base64}`;

            const newImage = imageUrl;

            return newImage;
        } catch (error) {
            Alert.alert(
                "Помилка",
                `Не вдалося вибрати зображення: ${
                    error instanceof Error ? error.message : "Невідома помилка"
                }`,
            );
            return null;
        }
    }

    if (!user) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center", flex: 1 },
                ]}
            >
                <Text
                    style={{
                        fontSize: 18,
                        textAlign: "center",
                        marginBottom: 20,
                    }}
                >
                    Ви не авторизовані
                </Text>
                <TouchableOpacity style={styles.authButton} onPress={handlePress}>
                    <Text style={styles.authButtonText}>Увійти або зареєструватись</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={{
                paddingBottom: 30,
                marginTop: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#E9E5EE",
            }}
            scrollEnabled={!isDrawing}
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
        >
            <View style={{ gap: 8, width: "90%", alignItems: "center", justifyContent: "center" }}>
                <View style={styles.container}>
                    <View style={styles.userInfoFirst}>
                        <Text style={styles.userInfoText}>Картка профілю</Text>
                        <TouchableOpacity
                            onPress={isEditing ? handleSubmit(handleSave) : handleEditToggle}
                        >
                            {isEditing ? (
                                <View style={styles.buttonSave}>
                                    <PencilIcon width={15} height={15} />
                                    <Text
                                        style={{
                                            color: "#543C52",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Зберегти
                                    </Text>
                                </View>
                            ) : (
                                <Image
                                    source={require("../../shared/ui/images/pencil-in-circle.png")}
                                    style={styles.pencilImage}
                                />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ gap: 24, alignItems: "center" }}>
                        <Controller
                            control={control}
                            name="image"
                            render={({ field }) => (
                                <TouchableOpacity
                                    onPress={async () => {
                                        if (!isEditing) return;
                                        const selectedImage = await onSearch();
                                        if (selectedImage) {
                                            field.onChange(selectedImage);
                                        }
                                    }}
                                    disabled={!isEditing}
                                >
                                    <Image
                                        source={
                                            field.value
                                                ? { uri: field.value }
                                                : require("../../shared/ui/images/avatar.png")
                                        }
                                        style={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: 48,
                                        }}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                        <View
                            style={{
                                gap: 10,
                                width: "100%",
                                alignItems: "center",
                                marginBottom: 5,
                            }}
                        >
                            {!isEditing ? (
                                <Text
                                    style={{
                                        fontSize: 24,
                                        color: "#070A1C",
                                        fontWeight: "700",
                                    }}
                                >
                                    {user.name} {user.surname}
                                </Text>
                            ) : null}

                            {isEditing ? (
                                <Controller
                                    control={control}
                                    name="username"
                                    render={({ field }) => (
                                        <Input
                                            style={{ width: "100%" }}
                                            label="Юзернейм"
                                            placeholder="Введіть ваш юзер"
                                            value={field.value}
                                            onChange={field.onChange}
                                            onChangeText={field.onChange}
                                            editable={isEditing}
                                        />
                                    )}
                                />
                            ) : (
                                <TouchableOpacity onPress={() => setIsEditing(true)}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: "#070A1C",
                                            fontWeight: "500",
                                            alignSelf: "center",
                                        }}
                                    >
                                        @{user.username}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.container}>
                    <View style={styles.userInfoFirst}>
                        <Text style={styles.userInfoText}>Особиста інформація</Text>
                        <TouchableOpacity
                            onPress={isEditing2 ? handleSubmit(handleSave) : handleEditToggle2}
                        >
                            {isEditing2 ? (
                                <View style={styles.buttonSave}>
                                    <PencilIcon width={15} height={15} />
                                    <Text
                                        style={{
                                            color: "#543C52",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Зберегти
                                    </Text>
                                </View>
                            ) : (
                                <Image
                                    source={require("../../shared/ui/images/pencil-in-circle.png")}
                                    style={styles.pencilImage}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <Input
                                    style={{ width: "100%" }}
                                    label="Ім'я"
                                    placeholder="Введіть ваше ім'я"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onChangeText={field.onChange}
                                    editable={isEditing2}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="surname"
                            render={({ field }) => (
                                <Input
                                    style={{ width: "100%" }}
                                    label="Прізвище"
                                    placeholder="Введіть ваше прізвище"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onChangeText={field.onChange}
                                    editable={isEditing2}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="dateOfBirth"
                            render={({ field }) => {
                                const [show, setShow] = useState(false);
                                const showDatepicker = () => setShow(true);

                                return (
                                    <>
                                        <Pressable
                                            onPress={isEditing2 ? showDatepicker : undefined}
                                        >
                                            <Input
                                                style={{ width: "100%" }}
                                                label="Дата народження"
                                                value={field.value?.toLocaleDateString()}
                                                editable={false}
                                                pointerEvents="none"
                                            />
                                        </Pressable>
                                        {show && (
                                            <DateTimePicker
                                                value={field.value || new Date()}
                                                mode="date"
                                                display={
                                                    Platform.OS === "ios" ? "spinner" : "default"
                                                }
                                                onChange={(event, selectedDate) => {
                                                    setShow(Platform.OS === "ios");
                                                    if (selectedDate) {
                                                        field.onChange(selectedDate);
                                                    }
                                                }}
                                                maximumDate={new Date()}
                                            />
                                        )}
                                    </>
                                );
                            }}
                        />
                        <Controller
                            control={control}
                            name="email"
                            render={({ field }) => (
                                <Input
                                    style={{ width: "100%" }}
                                    label="Електронна адреса"
                                    placeholder="Введіть вашу електронну адресу"
                                    keyboardType="email-address"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onChangeText={field.onChange}
                                    editable={isEditing2}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="newPassword"
                            render={({ field }) => (
                                <Input.Password
                                    style={{ width: "100%" }}
                                    label="Новий пароль"
                                    placeholder="Введіть ваш пароль"
                                    secureTextEntry
                                    editable={isEditing2}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onChangeText={field.onChange}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="oldPassword"
                            render={({ field }) => (
                                <Input.Password
                                    style={{ width: "100%" }}
                                    label="Старий пароль"
                                    placeholder="Введіть ваш пароль"
                                    secureTextEntry
                                    editable={isEditing2}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onChangeText={field.onChange}
                                />
                            )}
                        />
                        <Text
                            style={{
                                color: "#543C52",
                                fontSize: 14,
                                marginTop: 8,
                                alignItems: "center",
                                textAlign: "center",
                            }}
                        >
                            Для зміни паролю необхідно ввести старий та новий паролі!
                        </Text>
                    </View>
                </View>

                {/* <View style={styles.container}>
                    <View style={styles.userInfoFirst}>
                        <Text style={styles.userInfoText}>Варіанти підпису</Text>
                        <Image
                            source={require("../../shared/ui/images/pencil-in-circle.png")}
                            style={styles.pencilImage}
                        />
                    </View>
                    <View style={{ gap: 24, padding: 16 }}>
                        <View style={{ gap: 16 }}>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "500",
                                    color: "#543C52",
                                }}
                            >
                                Ім`я та прізвище
                            </Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "400",
                                    color: "#070A1C",
                                }}
                            >
                                {user.name} {user.surname}
                            </Text>
                        </View>
                        <View>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "500",
                                    color: "#543C52",
                                    marginBottom: 10,
                                }}
                            >
                                Мій електронний підпис
                            </Text>
                            <SignaturePad
                                ref={signatureRef}
                                onDrawingStart={() => setIsDrawing(true)}
                                onDrawingEnd={() => setIsDrawing(false)}
                            />
                        </View>
                    </View>
                </View> */}
            </View>
        </ScrollView>
    );
}
