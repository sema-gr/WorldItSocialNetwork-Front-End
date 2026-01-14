import { RegFormOne } from "../../../src/modules/auth/ui/reg-form-one";
import { LoginFormOne } from "../../../src/modules/auth/ui/login-form-one";
import { Animated, Dimensions, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useRef, useState, useEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const screenWidth = Dimensions.get("window").width;

export default function Register() {
    const [isRegister, setIsRegister] = useState(true);
    const translateX = useRef(new Animated.Value(0)).current;
    // const insets = useSafeAreaInsets();

    useEffect(() => {
        translateX.setValue(0);
    }, []);

    const toggleForm = () => {
        Animated.timing(translateX, {
            toValue: isRegister ? -screenWidth : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
        setIsRegister(!isRegister);
    };

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            enableOnAndroid={true}
            style={{ flex: 1 }}
            overScrollMode="never"
            extraScrollHeight={0}
        >
            <View style={styles.card}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity onPress={() => !isRegister && toggleForm()}>
                        <Text style={[styles.tabText, isRegister && styles.tabTextActive]}>
                            Реєстрація
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => isRegister && toggleForm()}>
                        <Text style={[styles.tabText, !isRegister && styles.tabTextActive]}>
                            Авторизація
                        </Text>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        width: screenWidth - 40,
                        overflow: "hidden",
                    }}
                >
                    <Animated.View
                        style={{
                            flexDirection: "row",
                            width: (screenWidth - 40) * 2,
                            transform: [{ translateX }],
                            gap: 40,
                        }}
                    >
                        <View style={{ width: screenWidth - 40 }}>
                            <RegFormOne />
                        </View>
                        <View
                            style={{
                                // width: screenWidth - 40,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <LoginFormOne />
                        </View>
                    </Animated.View>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    tabText: {
        fontSize: 24,
        fontWeight: "500",
        color: "#81818D",
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 44,
        gap: 24,
    },
    scroll: {
        flexGrow: 1,
        // flex: 1,
        alignItems: "center",
        paddingTop: 30,
        // justifyContent: "center",
        // paddingBottom: 20,
        backgroundColor: "#E9E5EE",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        width: 343,
        alignItems: "center",
        paddingBottom: 44,
        // marginBottom: 20,
        // height: '100%'
    },
    tabTextActive: {
        color: "#070A1C",
        fontWeight: "700",
        textDecorationLine: "underline",
    },
});
