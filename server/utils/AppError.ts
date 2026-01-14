
import { HttpCode, HttpCodes } from "../constants/http-codes.js";
import { ErrorCode, ErrorCodes } from "../constants/error-codes.js";

export class AppError extends Error {
  public readonly statusCode: HttpCode;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpCode = HttpCodes.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = ErrorCodes.INTERNAL_ERROR,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
