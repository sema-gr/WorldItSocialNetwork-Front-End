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
        }, 200);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!user || !chats || !users) return;
        // console.log(JSON.stringify(user, null, 2));
        const membersIds: number[] = [];
        chats.forEach(chat => {
            if (chat.is_personal_chat) {
                chat.members.forEach(member => {
                    if (member.profile_id !== user.id) {
                        user.chat_group_members?.forEach(chatGroup => {
                            if (chatGroup.chat_groupId === chat.id) {
                                membersIds.push(member.profile_id);
                            }
                        });
                    }
                });
            }
        });
        const filteredUsers = users.filter(user => {
            return membersIds.includes(user.id);
        });

        setChatMembers(filteredUsers);
    }, [chats, user, users]);

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
                        c => c.is_personal_chat && c.members.some(m => m.profile_id === item.id),
                    );

                    const lastMessage = chat?.chat_messages?.at(-1);

                    return (
                        <TouchableOpacity
                            onPress={() => {
                                if (chat) {
                                    router.push({
                                        pathname: "/chat",
                                        params: {
                                            chat_id: chat.id,
                                            name: item.name,
                                            avatar: item.image,
                                            username: item.username,
                                            lastAtMessage: lastMessage?.sent_at.toString(),
                                        },
                                    });
                                }
                            }}
                        >
                            <Friend2
                                user={{
                                    name: item.name ?? "User",
                                    image: item.image ?? "uploads/user.png",
                                    surname: item.surname ?? "User",
                                }}
                                lastMessage={lastMessage?.content.toString()}
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
