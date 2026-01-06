import { useEffect, useState } from "react";
import { usePosts } from "../post/hooks/use-get-post";
import { useUserContext } from "../auth/context/user-context";
import { IPost } from "../post/types/post";
import { FlatList, View, Text, StyleSheet } from "react-native";
import Post from "../post/ui/main-page/main.page";

export function MyPublications() {
    const { posts, refresh } = usePosts();
    const { user, refreshUser } = useUserContext();
    const [userPosts, setUserPosts] = useState<IPost[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            refresh();
            refreshUser();
        }, 1000); // кожну 1 секунду

        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const myPosts = posts.filter(post => post.author_id === user.id);
        setUserPosts(myPosts);
    }, [posts, user]);

    return (
        <FlatList
            overScrollMode="never"
            style={{ gap: 20 }}
            data={userPosts}
            keyExtractor={item => `${item.id}`}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
                <View style={styles.postContainer}>
                    <Post
                        id={item.id}
                        title={item.title}
                        content={item.content}
                        images={item.images}
                        links={item.links}
                        tags={item.tags}
                        author_id={item.author_id}
                        likes={item.likes}
                        views={item.views}
                        theme={item.theme}
                    />
                </View>
            )}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text>Немає постів для відображення</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        paddingVertical: 10,
    },
    postContainer: {
        width: "100%",
        maxWidth: 800,
        backgroundColor: "#FAF8FF",
        borderRadius: 8,
        overflow: "hidden",
    },
    emptyContainer: {
        padding: 20,
        alignItems: "center",
    },
});
