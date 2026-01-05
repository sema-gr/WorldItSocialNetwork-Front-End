import { useState, useEffect, useCallback } from "react";
import { IUser } from "../../auth/types";
import { API_BASE_URL } from "../../../settings";

export function useUserByID(id: number) {
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUser = useCallback(async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/users/${id}`);
            const result = await response.json();

            if (!response.ok || result?.status === "error") {
                setError(result?.message || "Failed to fetch user");
                return;
            }

            setUser(result.data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            console.log(message);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        getUser();
    }, [getUser]);

    return {
        user,
        isLoading,
        error,
        refresh: getUser,
        setUser,
    };
}
