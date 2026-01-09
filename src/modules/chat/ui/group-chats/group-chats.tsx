import { useEffect, useState } from "react";
import { View, Text, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { Friend2 } from "../friend2/friend";
import { useUserContext } from "../../../auth/context/user-context";
import { useChats } from "../../hooks/useChats";
import { useRouter } from "expo-router";
import { styles } from "./group-chats.style";
import { Chat } from "../../types/socket";
import { ChatGroupIcon } from "../../../../shared/ui/icons/groupChats";

export function GroupChats({ scrollable = true }: { scrollable?: boolean }) {
    const { user } = useUserContext();
    const { chats, refetchChats } = useChats();
    const [groupChats, setGroupChats] = useState<Chat[]>([]);
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            refetchChats();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!user || !chats) return;

        const userGroupChats = chats.filter(
            chat =>
                !chat.is_personal_chat &&
                chat.members.some(member => member.profile_id === user.id),
        );

        setGroupChats(userGroupChats);
    }, [chats, user]);

    const content = (
        <View style={styles.container}>
            <View style={styles.header}>
                <ChatGroupIcon style={{ width: 20, height: 20 }} />
                <Text style={styles.title}>Групові чати</Text>
            </View>

            <FlatList
                data={groupChats}
                scrollEnabled={false}
                keyExtractor={item => `${item.id}`}
                contentContainerStyle={{ gap: 10, flexGrow: 1 }}
                renderItem={({ item }) => {
                    const lastMessage = item.chat_messages?.at(-1);

                    return (
                        <TouchableOpacity
                            onPress={() => {
                                router.push({
                                    pathname: "/chatGroup",
                                    params: {
                                        chat_id: item.id,
                                        name: item.name,
                                        id_admin: item.admin_id.toString(),
                                        members: JSON.stringify(
                                            item.members.map(m => ({
                                                id: m.profile_id,
                                                name: m.profile.name,
                                                avatar: m.profile.image,
                                            })),
                                        ),
                                        lastAtMessage: lastMessage?.sent_at.toString(),
                                    },
                                });
                            }}
                        >
                            <Friend2
                                user={{
                                    name: item.name,
                                }}
                                lastMessage={
                                    lastMessage?.content.toString()
                                        ? lastMessage?.content.toString()
                                        : lastMessage?.attached_image
                                          ? "Фото"
                                          : "Немає повідомлень"
                                }
                                timeMessage={lastMessage?.sent_at.toString()}
                                groupChat={true}
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
