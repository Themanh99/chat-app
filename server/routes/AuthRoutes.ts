
import { Router } from "express";
import { signUp, login, logout, refreshToken, getUserInfo, updateProfile, updateSettings, updatePassword, searchUsers } from "../controllers/AuthController.js";
import { initiateSSO, handleSSOCallback } from "../controllers/SSOController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const authRoutes = Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh", refreshToken);
authRoutes.get("/sso", initiateSSO);
authRoutes.get("/sso/callback", handleSSOCallback);
authRoutes.get("/me", verifyToken, getUserInfo);
authRoutes.put("/update-profile", verifyToken, updateProfile);
authRoutes.put("/update-settings", verifyToken, updateSettings);
authRoutes.put("/update-password", verifyToken, updatePassword);
authRoutes.post("/search-users", verifyToken, searchUsers);


export default authRoutes;
