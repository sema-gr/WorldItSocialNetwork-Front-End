import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { useUsers } from "../../../friends/hooks/useUsers";
import { styles } from "./messages.styles";
import { Friend2 } from "../friend2/friend";
import { IUser } from "../../../auth/types";
import { useUserContext } from "../../../auth/context/user-context";
import { useChats } from "../../hooks/useChats";
import { useRouter } from "expo-router";
import { ChatsIcon } from "../../../../shared/ui/icons/chats";

export function MessagesScreen({ scrollable = true }: { scrollable?: boolean }) {
    const { user } = useUserContext();
    const { chats, refetchChats } = useChats();
    const [chatMembers, setChatMembers] = useState<IUser[]>([]);
    const router = useRouter();
    const { users, refresh } = useUsers();

    useEffect(() => {
        const interval = setInterval(() => {
            refetchChats();
            refresh();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!user || !chats) return;

        // Фільтруємо чати, щоб лишились тільки ті, де є користувач
        const filteredChats = chats.filter(chat =>
            chat.members.some(m => m.profile_id === user.id),
        );

        const personalChats = filteredChats.filter(c => c.is_personal_chat);

        const companions = personalChats
            .map(chat => chat.members.find(m => m.profile_id !== user.id)?.profile)
            .filter(Boolean);

        setChatMembers(companions as IUser[]);
    }, [chats, user]);

    const content = (
        <View style={styles.container}>
            <View style={styles.header}>
                <ChatsIcon style={{ width: 25, height: 25 }} />
                <Text style={styles.title}>Повідомлення</Text>
            </View>

            <FlatList
                data={chatMembers}
                scrollEnabled={false}
                keyExtractor={item => `${item.id}`}
                contentContainerStyle={{ gap: 10, flexGrow: 1 }}
                renderItem={({ item }) => {
                    const chat = chats.find(
                        c =>
                            c.is_personal_chat &&
                            c.members.some(m => m.profile_id === user?.id) &&
                            c.members.some(m => m.profile_id === item.id),
                    );

                    const lastMessage = chat?.chat_messages?.at(-1);

                    return (
                        <TouchableOpacity
                            onPress={() => {
                                if (chat) {
                                    const companion = chat.members.find(
                                        m => m.profile_id !== user?.id,
                                    )?.profile;

                                    router.push({
                                        pathname: "/chat",
                                        params: {
                                            chat_id: chat.id,
                                            companion_id: companion?.id,
                                            companion_name: companion?.name,
                                            companion_avatar: companion?.image,
                                            companion_username: companion?.username,
                                        },
                                    });
                                }
                            }}
                        >
                            <Friend2
                                user={{
                                    name: item.name ?? "User",
                                    image: item.image,
                                    surname: item.surname ?? "User",
                                }}
                                lastMessage={
                                    lastMessage?.content.toString()
                                        ? lastMessage?.content.toString()
                                        : lastMessage?.attached_image
                                          ? "Фото"
                                          : "Немає повідомлень"
                                }
                                timeMessage={lastMessage?.sent_at.toString()}
                            />
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View>
                        <Text>Немає повідомлень</Text>
                    </View>
                }
            />
        </View>
    );

    return scrollable ? <ScrollView overScrollMode="never">{content}</ScrollView> : content;
}
