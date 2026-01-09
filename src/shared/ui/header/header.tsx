import { View, Image, TouchableWithoutFeedback } from "react-native";
import W from "../icons/logo/w";
import O from "../icons/logo/o";
import R from "../icons/logo/r";
import L from "../icons/logo/l";
import D from "../icons/logo/d";
import I from "../icons/logo/i";
import T from "../icons/logo/t";
import { styles } from "./header.styles";
import { useRouter } from "expo-router";
import { useState } from "react";
import { MyPublicationModal } from "../../../modules/my_publications/modal/modal";
import { useUserContext } from "../../../modules/auth/context/user-context";
import { AddAlbumModal } from "../../../modules/albums/ui/add-album-modal/add-album-modal";
import { AddFriendModal } from "../../../modules/chat/ui/modals/createGroupModal/firstStepModal/firstStepModal";

interface HeaderProps {
    actionType?: 1 | 2 | 3; // 1 пости, 2 альбоми, 3 групові чати
    settings?: boolean;
}

function Header({ actionType, settings }: HeaderProps) {
    const router = useRouter();
    const { user, logout } = useUserContext();
    const [modalOpened, setModalOpened] = useState<boolean>(false);

    const onReg = () => {
        router.push("/settings");
    };

    const toggleModal = () => {
        setModalOpened(!modalOpened);
    };

    return (
        <View style={styles.container}>
            {modalOpened && actionType === 1 && (
                <MyPublicationModal modalVisible={modalOpened} changeVisibility={toggleModal} />
            )}
            {modalOpened && actionType === 2 && (
                <AddAlbumModal
                    modalVisible={modalOpened}
                    changeVisibility={toggleModal}
                    onClose={toggleModal}
                />
            )}
            {modalOpened && actionType === 3 && (
                <AddFriendModal
                    modalVisible={modalOpened}
                    // changeVisibility={toggleModal}
                    onClose={toggleModal}
                />
            )}
            <View
                style={{
                    flexDirection: "row",
                    gap: 5,
                    paddingLeft: 16,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Image
                    style={styles.worldItLogo}
                    source={require("../../ui/images/world-it-logo.png")}
                />
                <View style={{ flexDirection: "row", gap: 1, padding: 2 }}>
                    <W style={styles.w} />
                    <O style={styles.o} />
                    <R style={styles.r} />
                    <L style={styles.l} />
                    <D style={styles.d} />
                </View>
                <View style={{ flexDirection: "row", gap: 1, paddingTop: 5 }}>
                    <I style={styles.i} />
                    <T style={styles.t} />
                </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginRight: 16 }}>
                {user && actionType ? (
                    <TouchableWithoutFeedback onPress={toggleModal}>
                        <Image
                            style={styles.plus}
                            source={require("../images/plus-in-circle.png")}
                        />
                    </TouchableWithoutFeedback>
                ) : null}
                {settings && (
                    <TouchableWithoutFeedback onPress={onReg}>
                        <Image
                            style={styles.settings}
                            source={require("../images/settings-in-circle.png")}
                        />
                    </TouchableWithoutFeedback>
                )}
                <TouchableWithoutFeedback onPress={logout}>
                    <Image style={styles.exit} source={require("../images/exit-in-circle.png")} />
                </TouchableWithoutFeedback>
            </View>
        </View>
    );
}

function HeaderSecond() {
    return (
        <View style={styles.container2}>
            <View
                style={{
                    flexDirection: "row",
                    gap: 5,
                    paddingLeft: 16,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Image
                    style={styles.worldItLogo}
                    source={require("../../ui/images/world-it-logo.png")}
                />
                <View style={{ flexDirection: "row", gap: 1, padding: 2 }}>
                    <W style={styles.w} />
                    <O style={styles.o} />
                    <R style={styles.r} />
                    <L style={styles.l} />
                    <D style={styles.d} />
                </View>
                <View style={{ flexDirection: "row", gap: 1, paddingTop: 5 }}>
                    <I style={styles.i} />
                    <T style={styles.t} />
                </View>
            </View>
        </View>
    );
}

Header.HeaderSecond = HeaderSecond;

export { Header };
