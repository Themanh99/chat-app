
import { useAuthStore } from "../store/auth-store";
import { apiClient } from "../lib/api-client";
import { AUTH_ROUTES } from "../lib/constants";
import { useState } from "react";
import { message } from "antd";

export const useAuth = () => {
    const { userInfo, setUserInfo, clearUserInfo } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const login = async (data: any) => {
        setLoading(true);
        try {
            const response = await apiClient.post(AUTH_ROUTES.LOGIN, data);
            if (response.data.user) {
                setUserInfo(response.data.user);
                message.success("Login successful");
                return response.data.user;
            }
        } catch (error: any) {
             message.error(error.response?.data?.error?.message || "Login failed");
             throw error;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (data: any) => {
        setLoading(true);
        try {
             const response = await apiClient.post(AUTH_ROUTES.SIGN_UP, data);
             if (response.data.user) {
                 setUserInfo(response.data.user);
                 message.success("Signup successful");
                 return response.data.user;
             }
        } catch (error: any) {
             message.error(error.response?.data?.error?.message || "Signup failed");
             throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
       try {
           await apiClient.post("/api/auth/logout");
           clearUserInfo();
           message.success("Logged out");
       } catch (error) {
           console.error(error);
       }
    };

    return {
        userInfo,
        isAuthenticated: !!userInfo,
        loading,
        login,
        signup,
        logout
    };
};
