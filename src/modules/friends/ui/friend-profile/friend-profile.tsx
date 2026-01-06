import { ScrollView, View, Image, Text, FlatList, TouchableOpacity } from "react-native";
import { useUserContext } from "../../../auth/context/user-context";
import OfflineIcon from "../../../../shared/ui/icons/offline-circle";
import { Button } from "../../../../shared/ui/button";
import { styles } from "./friend-profile.styles";
import { IUser } from "../../../auth/types";
import { useAlbums } from "../../../albums/hooks/useAlbums";
import { Album } from "../../../albums/ui/album/album";
import { API_BASE_URL } from "../../../../settings";
import { useEffect, useState } from "react";
import { IAlbum } from "../../../albums/types/albums.types";
import { usePosts } from "../../../post/hooks/use-get-post";
import Post from "../../../post/ui/main-page/main.page";
import { IPost } from "../../../post/types/post";
import BackArrowIcon from "../../../../shared/ui/icons/arrowBack";
import { useRouter } from "expo-router";
import { useFriends } from "../../hooks/useFriends";
import { IFriendship } from "../../types/friends.type";
import { useChats } from "../../../chat/hooks/useChats";

interface FriendProfileProps {
    user: IUser;
}

export function FriendProfile({ user }: FriendProfileProps) {
    const { albums } = useAlbums();
    const { posts } = usePosts();
    const { friends } = useFriends();
    const { chats } = useChats();
    const { user: currentUser } = useUserContext();
    const router = useRouter();
    const [myAlbums, setMyAlbums] = useState<IAlbum[]>([]);
    const [myPosts, setMyPosts] = useState<IPost[]>([]);
    const [myFriends, setMyFriends] = useState<IFriendship[]>([]);

    useEffect(() => {
        if (!user) return;
        setMyAlbums(albums.filter(album => album.author_id === user.id));
        setMyPosts(posts.filter(post => post.author_id === user.id));
        setMyFriends(
            friends.filter(
                friend =>
                    (friend.profile1_id === user.id || friend.profile2_id === user.id) &&
                    friend.accepted,
            ),
        );
    }, [albums, user, posts, friends]);

    function onBack() {
        router.back();
    }

    function onWrite() {
        const existingChat = chats.find(chat => {
            if (!currentUser || !user) return false;
            const memberIds = chat.members.map(m => m.profile_id);
            return (
                memberIds.includes(currentUser.id) &&
                memberIds.includes(user.id) &&
                chat.members.length === 2
            );
        });
        console.log("existingChat:", existingChat);
        if (existingChat) {
            console.log("Navigating to existing chat:", existingChat.id);
            return router.navigate({
                pathname: "/chat",
                params: {
                    chat_id: existingChat.id,
                    name: user.name,
                    avatar: user.image,
                    username: user.username,
                    lastAtMessage:
                        user.chat_messages?.at(-1)?.chat_messages.at(-1)?.sent_at.toString() ||
                        new Date().toISOString(),
                },
            });
        }
    }

    return (
        <ScrollView style={styles.scrollView} overScrollMode="never">
            <View style={styles.container}>
                <View style={styles.profileContainer}>
                    <View style={styles.containerBack}>
                        <TouchableOpacity onPress={onBack}>
                            <BackArrowIcon style={{ width: 20, height: 20 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.profileImageContainer}>
                        <Image
                            style={styles.profileImage}
                            source={{ uri: API_BASE_URL + "/" + user.image }}
                        />
                        <OfflineIcon style={styles.imageOnline} />
                    </View>
                    <View style={styles.userInfo}>
                        {!user ? (
                            <Text>Нету пользователя</Text>
                        ) : (
                            <View>
                                <Text style={styles.name}>
                                    {user.name} {user.surname}
                                </Text>
                                <Text style={styles.username}>@{user.username}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={[styles.statItem, styles.statItemWithBorder]}>
                            <Text style={styles.statNumber}>{myAlbums.length}</Text>
                            <Text style={styles.statLabel}>Альбоми</Text>
                        </View>
                        <View style={[styles.statItem, styles.statItemWithBorder]}>
                            <Text style={styles.statNumber}>{myPosts.length}</Text>
                            <Text style={styles.statLabel}>Пости</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{myFriends.length}</Text>
                            <Text style={styles.statLabel}>Друзі</Text>
                        </View>
                    </View>
                    {myFriends.length > 0 ? (
                        <View style={styles.buttonContainer}>
                            <Button
                                onPress={onWrite}
                                label="Написати"
                                style={[styles.confirmButton]}
                            ></Button>
                            {/* <TouchableOpacity style={styles.deleteButton}>
							<Text style={styles.buttonText}>Видалити</Text>
						</TouchableOpacity> */}
                        </View>
                    ) : null}
                </View>
                <View style={styles.albumsContainer}>
                    <View style={styles.albumsSection}>
                        <View style={styles.albumsHeader}>
                            <View style={styles.albumsIcon}>
                                <Image
                                    style={{ height: 17, width: 17 }}
                                    source={require("../../../../shared/ui/images/album-image.png")}
                                />
                            </View>
                            <Text style={styles.albumsLabel}>Альбоми</Text>
                        </View>
                        {/* <Text style={styles.viewAll}>Дивитись всі</Text> */}
                    </View>

                    <FlatList
                        data={myAlbums}
                        scrollEnabled={false}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <Album
                                id={item.id}
                                name={item.name}
                                topic={item.topic}
                                created_at={item.created_at}
                                author_id={item.author_id}
                                images={item.images}
                            />
                        )}
                        contentContainerStyle={styles.albumsList}
                    />
                </View>
                {myPosts.length > 0 ? (
                    <View style={styles.albumsContainer}>
                        <View style={styles.albumsSection}>
                            <View style={styles.albumsHeader}>
                                <View style={styles.albumsIcon}>
                                    <Image
                                        style={{ height: 17, width: 17 }}
                                        source={require("../../../../shared/ui/images/album-image.png")}
                                    />
                                </View>
                                <Text style={styles.albumsLabel}>Пости</Text>
                            </View>
                            {/* <Text style={styles.viewAll}>Дивитись всі</Text> */}
                        </View>

                        <FlatList
                            data={myPosts}
                            scrollEnabled={false}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <Post
                                    id={item.id}
                                    theme={item.theme}
                                    title={item.title}
                                    content={item.content}
                                    author_id={item.author_id}
                                    likes={item.likes}
                                    views={item.views}
                                    tags={item.tags}
                                    images={item.images}
                                    links={item.links}
                                />
                            )}
                            contentContainerStyle={styles.albumsList}
                        />
                    </View>
                ) : null}
            </View>
        </ScrollView>
    );
}
