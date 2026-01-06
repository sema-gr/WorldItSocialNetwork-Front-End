import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { styles } from "./all.style";
import { FriendsForm } from "../friends-form/friends-form";
import { useUsers } from "../../hooks/useUsers";
import { useUserContext } from "../../../auth/context/user-context";
import { useEffect, useState } from "react";
import { IUser } from "../../../auth/types";

export function AllFriends({
    scrollable = true,
    limit = undefined,
    onShowAll,
}: {
    scrollable?: boolean;
    limit?: number;
    onShowAll?: () => void;
}) {
    const { users, refresh } = useUsers();
    const { user, refreshUser } = useUserContext();
    const [displayedUsers, setDisplayedUsers] = useState<IUser[]>([]);

    function updateFriendList() {
        if (!user) return;

        const myFriends = users.filter(userF =>
            user.friendship_to?.some(f => f.accepted === true && f.profile1_id === userF.id),
        );

        const friendsToAdd = users.filter(userF =>
            user.friendship_from?.some(f => f.accepted === true && f.profile2_id === userF.id),
        );

        const finalFriends = myFriends.concat(friendsToAdd);
        setDisplayedUsers(limit ? finalFriends.slice(0, limit) : finalFriends);
    }

    useEffect(() => {
        updateFriendList();
    }, [users, user]);

    useEffect(() => {
        const interval = setInterval(() => {
            refresh();
            refreshUser();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const content = (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Text style={[styles.text, { color: "#070A1C" }]}>Всі друзі</Text>
                <TouchableOpacity onPress={onShowAll}>
                    <Text style={[styles.text, { color: "#543C52" }]}>Дивитись всі</Text>
                </TouchableOpacity>
            </View>

            <View style={{ gap: 10, flexGrow: 1 }}>
                {displayedUsers.length > 0 ? (
                    displayedUsers.map(item => (
                        <FriendsForm
                            key={`${item.id}`}
                            {...item}
                            actionButton={{
                                label: "Профіль",
                                onPress: undefined,
                            }}
                            deleteId={item.id}
                            withoutDelete={true}
                        />
                    ))
                ) : (
                    <View>
                        <Text>Немає друзів</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return scrollable ? <ScrollView overScrollMode="never">{content}</ScrollView> : content;
}
