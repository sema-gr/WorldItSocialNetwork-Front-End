import { View, Image, Text, TouchableOpacity } from "react-native";
import { styles } from "./friend.styles";
import { IUser } from "../../../auth/types";
import { API_BASE_URL } from "../../../../settings";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useUserContext } from "../../../auth/context/user-context";

export function Friend1({
    userContact,
    withoutDelete,
}: {
    userContact: IUser;
    withoutDelete: boolean;
}) {
    const router = useRouter();
    const { user } = useUserContext();
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        async function getToken() {
            const token = await AsyncStorage.getItem("token");
            if (!token) return;
            setToken(token);
        }
        getToken();
    }, [token]);

    async function onPress() {
        if (!user) return;

        const {
            date_of_birth,
            friendship_from,
            friendship_to,
            chat_group_members,
            chat_messages,
            administered_groups,
            ...rest
        } = userContact;

        router.navigate({
            pathname: "/friends-profile",
            params: {
                ...rest,
                date_of_Birth: date_of_birth ? new Date(date_of_birth).toISOString() : undefined,
                withoutDelete: withoutDelete ? 1 : 0,
            },
        });
    }

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                {userContact?.image === null ? (
                    <Image
                        source={require("../../../../shared/ui/images/avatar.png")}
                        style={styles.avatar}
                    />
                ) : (
                    <Image
                        source={{
                            uri: API_BASE_URL + "/" + userContact?.image,
                        }}
                        style={styles.avatar}
                    />
                )}
                <View style={{ flexDirection: "row", gap: 4 }}>
                    <Text style={styles.name}>{userContact?.name || "Anonymous"}</Text>
                    <Text style={styles.name}>{userContact?.surname || "Anonymous"}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
