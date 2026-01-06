import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { FriendsForm } from "../friends-form/friends-form";
import { useUserContext } from "../../../auth/context/user-context";
import { styles } from "./recomend.style";
import { useUsers } from "../../hooks/useUsers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IUser } from "../../../auth/types";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../../settings";

export function RecomendFriends({
    scrollable = true,
    limit = undefined,
    onShowAll,
}: {
    scrollable?: boolean;
    limit?: number;
    onShowAll?: () => void;
}) {
    const { users, refresh } = useUsers();
    const { user } = useUserContext();

    const [correctUsers, setCorrectUsers] = useState<IUser[]>([]);
    const displayedUsers = limit ? correctUsers.slice(0, limit) : correctUsers;

    function updateRecommendations() {
        if (!user) return;

        const friendIds = [
            ...(user.friendship_to?.map(f => f.profile1_id) || []),
            ...(user.friendship_from?.map(f => f.profile2_id) || []),
        ];

        const filtered = users.filter(u => u.id !== user.id && !friendIds.includes(u.id));

        setCorrectUsers(filtered);
    }

    useEffect(() => {
        updateRecommendations();
    }, [users]);

    useEffect(() => {
        const interval = setInterval(() => {
            refresh();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    async function handleRequest(userTo: IUser) {
        try {
            if (!user) return;
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Помилка", "Користувач не авторизований");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/friendship/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    profile2_id: userTo.id,
                    accepted: false,
                }),
            });

            const result = await response.json();

            if (result.status === "error") {
                Alert.alert("Помилка", result.message);
                return;
            }
            updateRecommendations();

            Alert.alert("Успіх", "Запит відправлено");
        } catch (error) {
            Alert.alert("Error", "Could not save data");
        }
    }
    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Text style={[styles.text, { color: "#070A1C" }]}>Рекомендації</Text>
                <TouchableOpacity onPress={onShowAll}>
                    <Text style={[styles.text, { color: "#543C52" }]}>Дивитись всі</Text>
                </TouchableOpacity>
            </View>

            {scrollable ? (
                <ScrollView
                    contentContainerStyle={{ gap: 10 }}
                    overScrollMode="never"
                    nestedScrollEnabled
                >
                    {displayedUsers.length > 0 ? (
                        displayedUsers.map(item => (
                            <FriendsForm
                                key={item.id}
                                {...item}
                                actionButton={{
                                    label: "Додати",
                                    onPress: () => handleRequest(item),
                                }}
                                deleteId={item.id}
                            />
                        ))
                    ) : (
                        <Text>Немає друзів</Text>
                    )}
                </ScrollView>
            ) : (
                <View style={{ gap: 10 }}>
                    {displayedUsers.length > 0 ? (
                        displayedUsers.map(item => (
                            <FriendsForm
                                key={item.id}
                                {...item}
                                actionButton={{
                                    label: "Додати",
                                    onPress: () => handleRequest(item),
                                }}
                                deleteId={item.id}
                                withoutDelete={false}
                            />
                        ))
                    ) : (
                        <Text>Немає друзів</Text>
                    )}
                </View>
            )}
        </View>
    );
}
