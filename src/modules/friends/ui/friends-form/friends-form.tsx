import { View, Image, Text, TouchableOpacity, Alert } from "react-native";
import { IUser } from "../../../auth/types";
import { styles } from "./friends-form-style";
import OfflineIcon from "../../../../shared/ui/icons/offline-circle";
import { Button } from "../../../../shared/ui/button";
import { useRouter } from "expo-router";
import { useUserContext } from "../../../auth/context/user-context";
import { API_BASE_URL } from "../../../../settings";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FriendsFormProps = IUser & {
    actionButton: {
        label: string;
        onPress?: () => void;
    };
    withoutDelete?: boolean;
    deleteId: number;
};

export function FriendsForm(props: FriendsFormProps) {
    const navigation = useRouter();
    const { user } = useUserContext();

    function onPress() {
        const {
            date_of_birth,
            actionButton,
            deleteId,
            friendship_from,
            friendship_to,
            chat_group_members,
            chat_messages,
            administered_groups,
            ...rest
        } = props;

        navigation.navigate({
            pathname: "/friends-profile",
            params: {
                ...rest,
                date_of_Birth: date_of_birth ? new Date(date_of_birth).toISOString() : undefined,
                withoutDelete: props.withoutDelete ? 1 : 0,
            },
        });
    }

    async function handleDelete(clickedUserId: number) {
        try {
            if (!user) return;
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Помилка", "Користувач не авторизований");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/friendship/deleteFriendship`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    //profile1 - кому, profile2 - ми
                    id: clickedUserId,
                }),
            });

            const result = await response.json();

            if (result.status === "error") {
                Alert.alert("Помилка", result.message);
                return;
            }

            Alert.alert("Успіх", "Запит відхилено");
        } catch (error) {
            if (!(error instanceof Error)) return;
            Alert.alert("Помилка", "Не вдалося підтвердити запит");
            console.log(error.message);
        }
    }
    // console.log(props.image);

    return (
        <TouchableOpacity style={[styles.container, { flexShrink: 0 }]} onPress={onPress}>
            <View style={styles.profileContainer}>
                {props.image === null ? (
                    <Image
                        style={styles.profileImage}
                        source={require("../../../../shared/ui/images/avatar.png")}
                    />
                ) : (
                    <Image
                        style={styles.profileImage}
                        source={{ uri: API_BASE_URL + "/" + props.image }}
                    />
                )}
                <OfflineIcon style={styles.imageOnline} />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.nameText}>
                    {props.name} {props.surname}
                </Text>
                <Text style={styles.usernameText}>@{props.username}</Text>
            </View>

            <View style={styles.buttonsContainer}>
                <Button
                    style={styles.confirmButton}
                    label={props.actionButton.label}
                    onPress={props.actionButton.onPress ? props.actionButton.onPress : onPress}
                />
                {props.withoutDelete ? (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(props.deleteId)}
                    >
                        <Text style={styles.buttonDeleteText}>Видалити</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </TouchableOpacity>
    );
}
