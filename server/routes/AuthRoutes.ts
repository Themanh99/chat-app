
import { Router } from "express";
import { signUp, login, logout, refreshToken, getUserInfo } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const authRoutes = Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh", refreshToken);
authRoutes.get("/me", verifyToken, getUserInfo);

export default authRoutes;
