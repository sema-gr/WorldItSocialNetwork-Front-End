import { Text, Image, TouchableOpacity } from "react-native";
import { styles } from "./conntactWithCheckbox.styles";
import { API_BASE_URL } from "../../../../../settings";
import { IUser } from "../../../../auth/types";

interface Contact {
    userContact: IUser;
    isSelected: boolean;
    onPress?: () => void;
}

export function ContactWithCheckbox({ userContact, onPress }: Contact) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            {userContact.image === null ? (
                <Image
                    source={require("../../../../../shared/ui/images/avatar.png")}
                    style={styles.avatar}
                />
            ) : (
                <Image
                    source={{
                        uri: `${API_BASE_URL}/${userContact.image}`,
                    }}
                    style={styles.avatar}
                />
            )}
            <Text style={styles.name}>{userContact.name || "Anonymous"}</Text>
            {/* <Checkbox
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? '#4630EB' : undefined}
        /> */}
        </TouchableOpacity>
    );
}
