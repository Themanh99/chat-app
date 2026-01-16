import jwt from "jsonwebtoken";
import { Response } from "express";
import { env } from "../config/env.js";
import UserToken from "../models/UserToken.js";

export const generateTokens = async (userId: string, email: string) => {
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

export const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true, 
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
