import { Tabs } from "expo-router";
import { View } from "react-native";
import { Header } from "../../src/shared/ui/header";
import { styles } from "./styles";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeIcon from "../../src/shared/ui/icons/home";
import MyPub from "../../src/shared/ui/icons/my-pub";
import FriendsIcon from "../../src/shared/ui/icons/friends";
import ChatsMain from "../../src/shared/ui/icons/chats-main";

export default function TabsLayout() {
    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#ffffff", justifyContent: "space-between" }}
            edges={["top"]}
        >
            <Tabs
                initialRouteName="home"
                screenOptions={{
                    tabBarStyle: styles.footer,
                    tabBarShowLabel: false,
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <View
                                    style={{
                                        marginTop: 3,
                                        borderTopWidth: 2,
                                        borderTopColor: "#543C52",
                                    }}
                                >
                                    <HomeIcon />
                                </View>
                            ) : (
                                <HomeIcon />
                            ),
                        header: () => <Header actionType={1} />,
                    }}
                />
                <Tabs.Screen
                    name="my-publications"
                    options={{
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <View
                                    style={{
                                        marginTop: 3,
                                        borderTopWidth: 2,
                                        borderTopColor: "#543C52",
                                    }}
                                >
                                    <MyPub />
                                </View>
                            ) : (
                                <MyPub />
                            ),
                        header: () => <Header actionType={1} />,
                    }}
                />
                <Tabs.Screen
                    name="friends"
                    options={{
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <View
                                    style={{
                                        marginTop: 3,
                                        borderTopWidth: 2,
                                        borderTopColor: "#543C52",
                                    }}
                                >
                                    <FriendsIcon />
                                </View>
                            ) : (
                                <FriendsIcon />
                            ),
                        header: () => <Header />,
                    }}
                />
                <Tabs.Screen
                    name="chats"
                    options={{
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <View
                                    style={{
                                        marginTop: 3,
                                        borderTopWidth: 2,
                                        borderTopColor: "#543C52",
                                    }}
                                >
                                    <ChatsMain />
                                </View>
                            ) : (
                                <ChatsMain />
                            ),
                        header: () => <Header actionType={3} />,
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
