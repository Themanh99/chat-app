
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/UserModel.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { HttpCodes } from "../constants/http-codes.js";
import { ErrorCodes } from "../constants/error-codes.js";

const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 days

const createToken = (email: string, userId: string) => {
  return jwt.sign({ email, userId }, env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

// Zod Schemas
const signupSchema = z.object({
  email: z.string().email(),
  pass: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  pass: z.string().min(1),
});

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { email, pass } = signupSchema.parse(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already in use", HttpCodes.CONFLICT, ErrorCodes.DUPLICATE_ENTRY);
    }

    const user = await User.create({ email, pass });

    res.cookie("jwt", createToken(email, user.id), {
      secure: true,
      maxAge: maxAge,
      sameSite: "none",
    });

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

     res.cookie("jwt", createToken(email, user.id), {
      secure: true,
      maxAge: maxAge,
      sameSite: "none",
    });

    return res.status(HttpCodes.OK).json({
       user: {
         id: user._id,
         email: user.email,
         profileSetup: user.profileSetup,
         firstName: user.firstName,
         lastName: user.lastName,
         image: user.image,
         color: user.color
       }
    });

  } catch(err) {
      next(err);
  }
}
