
export const HOST = import.meta.env.VITE_SERVER_URL || "http://localhost:8747";
export const AUTH_ROUTES = {
  SIGN_UP: "/api/auth/signup",
  LOGIN: "/api/auth/login",
  GET_USER_INFO: "/api/auth/me",
  UPDATE_PROFILE: "/api/auth/update-profile",
  UPDATE_SETTINGS: "/api/auth/update-settings",
  UPDATE_PASSWORD: "/api/auth/update-password",
};
