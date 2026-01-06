import { ScrollView, View, Text, StyleSheet } from "react-native";
import Post from "../post/ui/main-page/main.page";
import { usePosts } from "../post/hooks/use-get-post";
import React, { useEffect } from "react";

export function Homepage() {
    const { posts, refresh } = usePosts();

    useEffect(() => {
        const interval = setInterval(() => {
            refresh();
        }, 1000); // кожну 1 секунди

        return () => clearInterval(interval);
    }, [posts]);

    return (
        <ScrollView
            overScrollMode="never"
            contentContainerStyle={[styles.listContainer, posts.length === 0 && styles.centerEmpty]}
        >
            {posts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text>Немає постів для відображення</Text>
                </View>
            ) : (
                posts.map(item => (
                    <View style={styles.postContainer} key={item.id}>
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
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        paddingVertical: 10,
        gap: 10,
    },
    centerEmpty: {
        flexGrow: 1,
        justifyContent: "center",
    },
    postContainer: {
        borderRadius: 8,
        overflow: "hidden",
    },
    emptyContainer: {
        padding: 20,
        alignItems: "center",
    },
});
