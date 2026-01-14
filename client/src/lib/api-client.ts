
import axios from "axios";

const HOST = import.meta.env.VITE_SERVER_URL;

export const apiClient = axios.create({
  baseURL: HOST,
  withCredentials: true, // Important for Cookies
});

// Response interceptor for general error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can handle global 401/403 here later (e.g., redirect to login)
    return Promise.reject(error);
  }
);
