import { View, Text } from "react-native";
import { Input } from "../../../../shared/ui/input";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../../../../shared/ui/button";
import { styles } from "./login-form-one.styles";
import { ILogin } from "./login-form-one.types";
import { useUserContext } from "../../context/user-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export function LoginFormOne() {
    const { control, handleSubmit } = useForm<ILogin>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { user, isAuthenticated, login } = useUserContext();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.replace("/home");
        }
    }, [isAuthenticated, user, router]);

    const onNext = async (data: ILogin) => {
        try {
            await login(data.email, data.password);
        } catch (err) {
            console.log("login error:", err);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.signUpText}>
                <Text style={styles.signUp}>Раді тебе знову бачити!</Text>
            </View>

            <View>
                <Controller
                    control={control}
                    name="email"
                    rules={{
                        required: "Email обов'язковий",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Невірний формат email",
                        },
                    }}
                    render={({ field, fieldState }) => (
                        <Input
                            placeholder="you@example.com"
                            value={field.value}
                            onChangeText={field.onChange}
                            error={fieldState.error?.message}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="password"
                    rules={{
                        required: "Пароль обов'язковий",
                        minLength: {
                            value: 5,
                            message: "Пароль повинен містити щонайменше 5 символів",
                        },
                    }}
                    render={({ field, fieldState }) => (
                        <Input.Password
                            placeholder="Введи пароль"
                            onChangeText={field.onChange}
                            value={field.value}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </View>
            <Button label={"Увійти"} onPress={handleSubmit(onNext)} />
            {/* <Text>-- або увійдіть за допомогою QR-коду --</Text> */}
        </View>
    );
}
