import { useCallback, useEffect, useState } from "react";
import { IUser } from "../../auth/types";
import { API_BASE_URL } from "../../../settings";

export function useUsers() {
    const [users, setUsers] = useState<IUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/users/all`);
            const result = await response.json();
            if (result.status === "error") {
                return;
            }
            setUsers(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            console.log(message);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    return { users, error, isLoading, refresh: getUsers };
}
