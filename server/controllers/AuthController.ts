
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/UserModel.js";
import UserToken from "../models/UserToken.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { HttpCodes } from "../constants/http-codes.js";
import { ErrorCodes } from "../constants/error-codes.js";

// --- Helpers ---

const generateTokens = async (userId: string, email: string) => {
  const accessToken = jwt.sign({ userId, email }, env.JWT_KEY, {
    expiresIn: env.ACCESS_TOKEN_AGE,
  });

  const refreshToken = jwt.sign({ userId, email }, env.JWT_REFRESH_KEY, {
    expiresIn: env.REFRESH_TOKEN_AGE,
  });

  // Calculate expiration date for persistence
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_AGE);

  // Parse persistence: save refresh token
  await UserToken.create({ userId, token: refreshToken, expiresAt });

  return { accessToken, refreshToken };
};

const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true, // env.NODE_ENV === "production" in real app, keeping true as per user request context
    sameSite: "none",
    maxAge: env.ACCESS_TOKEN_AGE,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: env.REFRESH_TOKEN_AGE,
  });
};

// --- Schemas ---

const signupSchema = z.object({
  email: z.string().email(),
  pass: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  pass: z.string().min(1),
});

// --- Controllers ---

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, pass } = signupSchema.parse(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already in use", HttpCodes.CONFLICT, ErrorCodes.DUPLICATE_ENTRY);
    }

    const user = await User.create({ email, pass });
    const { accessToken, refreshToken } = await generateTokens(user.id, user.email);

    setCookies(res, accessToken, refreshToken);

    return res.status(HttpCodes.CREATED).json({
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, pass } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User not found", HttpCodes.NOT_FOUND, ErrorCodes.RESOURCE_NOT_FOUND);
    }

    const isMatch = await user.comparePassword(pass);
    if (!isMatch) {
      throw new AppError("Invalid credentials", HttpCodes.UNAUTHORIZED, ErrorCodes.AUTHENTICATION_ERROR);
    }

    const { accessToken, refreshToken } = await generateTokens(user.id, user.email);
    setCookies(res, accessToken, refreshToken);

    return res.status(HttpCodes.OK).json({
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Remove specific refresh token from DB
      await UserToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "none" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" });

    res.status(HttpCodes.OK).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      throw new AppError("Refresh token missing", HttpCodes.UNAUTHORIZED, ErrorCodes.AUTHENTICATION_ERROR);
    }

    // 1. Verify locally
    const decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_KEY) as { userId: string; email: string };
    
    // 2. Verify in DB (Auth Persistence)
    const storedToken = await UserToken.findOne({ token: oldRefreshToken });

    // Reuse Detection / Token Theft prevention logic could go here
    // If token valid locally but not in DB -> possibly reused or revoked.

    if (!storedToken) {
       // Clear cookies if invalid
       res.clearCookie("accessToken");
       res.clearCookie("refreshToken");
       throw new AppError("Invalid or expired refresh token", HttpCodes.FORBIDDEN, ErrorCodes.AUTHENTICATION_ERROR);
    }

    // 3. Token Rotation: Delete old, create new
    await UserToken.deleteOne({ _id: storedToken._id });

    // Generate new pair
    const { accessToken, refreshToken } = await generateTokens(decoded.userId, decoded.email);
    setCookies(res, accessToken, refreshToken);

    return res.status(HttpCodes.OK).json({ success: true, message: "Token refreshed" });

  } catch (err) {
    next(err);
  }
};

export const getUserInfo = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.userId);
        if(!user) {
            throw new AppError("User not found", HttpCodes.NOT_FOUND, ErrorCodes.RESOURCE_NOT_FOUND);
        }
        return res.status(HttpCodes.OK).json({
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
              },
        });
    } catch(err) {
        next(err);
    }
}
