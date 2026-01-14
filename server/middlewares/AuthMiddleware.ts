
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpCodes } from "../constants/http-codes.js";
import { ErrorCodes } from "../constants/error-codes.js";
import { AppError } from "../utils/AppError.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId: string;
  email: string;
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(new AppError("You are not authenticated", HttpCodes.UNAUTHORIZED, ErrorCodes.AUTHENTICATION_ERROR));
  }

  jwt.verify(token, env.JWT_KEY, (err: any, decoded: any) => {
    if (err) {
       return next(new AppError("Token is not valid", HttpCodes.UNAUTHORIZED, ErrorCodes.AUTHENTICATION_ERROR));
    }
    
    req.userId = (decoded as JwtPayload).userId;
    next();
  });
};
