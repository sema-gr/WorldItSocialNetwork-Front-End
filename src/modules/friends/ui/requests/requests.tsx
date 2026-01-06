import { useEffect, useState } from "react";
import { useUsers } from "../../hooks/useUsers";
import { useUserContext } from "../../../auth/context/user-context";
import { IUser } from "../../../auth/types";
import { TouchableOpacity, View, Text, ScrollView, Alert } from "react-native";
import { styles } from "./requests.style";
import { FriendsForm } from "../friends-form/friends-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFriends } from "../../hooks/useFriends";
import { API_BASE_URL } from "../../../../settings";

export function RequestsFriends({
    scrollable = true,
    limit = undefined,
    onShowAll,
}: {
    scrollable?: boolean;
    onShowAll?: () => void;
    limit?: number;
}) {
    const { users, refresh } = useUsers();
    const { user } = useUserContext();
    const [displayedUsers, setDisplayedUsers] = useState<IUser[]>();
    const { refresh: refreshFriends } = useFriends();

    function getFriendRequests() {
        if (!user || !user.friendship_to) return;

        const myFriends = users.filter(userF =>
            user.friendship_to?.some(f => f.accepted === false && f.profile1_id === userF.id),
        );

        setDisplayedUsers(limit ? myFriends.slice(0, limit) : myFriends);
    }

    useEffect(() => {
        getFriendRequests();
    }, [user, users]);

    useEffect(() => {
        const interval = setInterval(() => {
            refresh();
            refreshFriends();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    async function handleAccept(clickedUserId: number) {
        try {
            if (!user) return;
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Помилка", "Користувач не авторизований");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/friendship/acceptFriendship`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: clickedUserId,
                }),
            });

            const result = await response.json();

            if (result.status === "error") {
                Alert.alert("Помилка", result.message);
                return;
            }

            getFriendRequests();

            Alert.alert("Успіх", "Запит прийнято");
        } catch (error) {
            Alert.alert("Помилка", "Не вдалося підтвердити запит");
        }
    }

    const list = (
        <View style={{ gap: 10 }}>
            {displayedUsers && displayedUsers.length > 0 ? (
                displayedUsers.map(item => (
                    <FriendsForm
                        key={item.id}
                        {...item}
                        actionButton={{
                            label: "Підтвердити",
                            onPress: () => handleAccept(item.id),
                        }}
                        deleteId={item.id}
                        withoutDelete={true}
                    />
                ))
            ) : (
                <Text>Немає друзів</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Text style={[styles.text, { color: "#070A1C" }]}>Запити</Text>
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
                    {list}
                </ScrollView>
            ) : (
                list
            )}
        </View>
    );
}
