
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
        logout,
        updateProfile: async (data: any) => {
            try {
                const response = await apiClient.put(AUTH_ROUTES.UPDATE_PROFILE, data);
                 if (response.data.user) {
                    setUserInfo(response.data.user);
                    message.success("Profile updated successfully");
                    return response.data.user;
                }
            } catch (error: any) {
                 message.error(error.response?.data?.error?.message || "Profile update failed");
                 throw error;
            }
        },
        updateSettings: async (data: any) => {
            try {
                 const response = await apiClient.put(AUTH_ROUTES.UPDATE_SETTINGS, data);
                 if (response.data.settings) {
                     // Optimistically update userInfo with new settings
                     // Note: You might need to merge this deeper depending on store structure
                     // Assuming setUserInfo merges or we re-fetch
                     // For now, let's re-fetch or manual update if setUserInfo supports partial
                     // If setUserInfo expects full object, we might need to manually construct it or re-fetch me
                     // But simpler: just use response.data.settings to update UI or refetch
                     
                     // Let's assume we re-fetch 'me' or verify logic. 
                     // Actually, better to just update the specific fields in store if possible.
                     // But wait, the previous `setUserInfo` replaces the object. 
                     // Let's assume `userInfo` has these fields now.
                     
                     // We need to merge settings into current userInfo
                     const currentUser = useAuthStore.getState().userInfo;
                     if (currentUser) {
                         setUserInfo({ ...currentUser, ...response.data.settings });
                     }
                     
                     message.success("Settings updated");
                     return response.data.settings;
                 }
            } catch (error: any) {
                console.error(error);
                message.error("Failed to update settings");
                throw error;
            }
        },
        updatePassword: async (data: any) => {
             try {
                await apiClient.put(AUTH_ROUTES.UPDATE_PASSWORD, data);
                message.success("Password updated successfully");
            } catch (error: any) {
                 message.error(error.response?.data?.error?.message || "Password update failed");
                 throw error;
            }
        },
        checkAuth: async () => {
            try {
                const response = await apiClient.get(AUTH_ROUTES.GET_USER_INFO);
                if (response.data.user) {
                    setUserInfo(response.data.user);
                    return response.data.user;
                }
            } catch (error) {
                // message.error("Session expired"); // Optional
                clearUserInfo();
                throw error;
            }
        }
    };
};
