import React, { useState, useRef, useEffect, ElementRef } from "react";
import { View, Text, TouchableOpacity, LayoutChangeEvent } from "react-native";
import { Image } from "expo-image";
import Dots from "../../../../shared/ui/icons/dots";
import { styles } from "./author.styles";
import { IPost } from "../../types/post";
import { ModalPost } from "../modal-post/modal-post";
import { useUserContext } from "../../../auth/context/user-context";
import { useUserByID } from "../../hooks/use-user-by-id";
import { API_BASE_URL } from "../../../../settings";

export function Author({ scrollOffset = 0, ...props }: IPost & { scrollOffset?: number }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [dotsPosition, setDotsPosition] = useState({ x: 150, y: 78 });
    const containerRef = useRef<View>(null);
    const dotsRef = useRef<ElementRef<typeof TouchableOpacity>>(null);
    const { user, refresh } = useUserByID(props.author_id);
    const { user: currentUser } = useUserContext();
    const [containerSize, setContainerSize] = useState({
        width: 400,
        height: 725,
    });

    useEffect(() => {
        refresh();
    }, [user]);

    const measureDots = () => {
        if (dotsRef.current) {
            dotsRef.current.measureInWindow((x, y) => {
                setDotsPosition({ x, y });
            });
        }
    };

    useEffect(() => {
        if (modalVisible) {
            measureDots();
        }
    }, [modalVisible]);

    useEffect(() => {
        if (modalVisible) {
            measureDots();
        }
    }, [scrollOffset, modalVisible]);

    const handleContainerLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({ width, height });
    };

    return (
        <View style={styles.container} ref={containerRef} onLayout={handleContainerLayout}>
            <View style={styles.main}>
                <View style={styles.contant}>
                    <View style={{ position: "relative" }}>
                        <Image
                            key={user?.image}
                            style={{ width: 50, height: 50, borderRadius: 200 }}
                            source={{ uri: `${API_BASE_URL}/${user?.image}` }}
                        />
                        <Image
                            style={{
                                width: 20,
                                height: 20,
                                position: "absolute",
                                top: 27,
                                left: 27,
                            }}
                            source={require("../../../../shared/ui/images/avatar-indicator.png")}
                        />
                    </View>
                    <Text>
                        {user?.name} {user?.surname}
                    </Text>
                </View>

                <Image
                    style={{ height: 50, width: 130.83 }}
                    source={require("../../../../shared/ui/images/signature.png")}
                />
            </View>
            {currentUser?.id === props.author_id ? (
                <View>
                    <TouchableOpacity
                        ref={dotsRef}
                        onPress={() => setModalVisible(true)}
                        style={styles.dotsButton}
                    >
                        <Dots style={{ height: 20, width: 20 }} />
                    </TouchableOpacity>
                </View>
            ) : null}
            <ModalPost
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                post_id={props.id}
                dotsPosition={dotsPosition}
                containerSize={containerSize}
                scrollOffset={scrollOffset}
            />
        </View>
    );
}
