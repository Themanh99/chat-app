
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { HttpCodes } from "../constants/http-codes.js";
import { ErrorCodes } from "../constants/error-codes.js";
import { env } from "../config/env.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(HttpCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: "Validation Error",
        details: (err as ZodError).issues,
      },
    });
  }

  // Handle other known errors (e.g. Mongoose, JWT)
  if (err.name === "JsonWebTokenError") {
     return res.status(HttpCodes.UNAUTHORIZED).json({
        success: false,
        error: {
            code: ErrorCodes.AUTHENTICATION_ERROR,
            message: "Invalid Token"
        }
     })
  }

  // Fallback for unknown errors
  console.error("Unhandled Error:", err);
  return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    },
  });
};
