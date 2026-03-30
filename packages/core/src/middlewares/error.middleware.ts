import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError, BadRequestError, ConflictError } from "../errors/app-error";
import { logger } from "../utils/logger";

interface MongoErrorLike {
  code?: unknown;
}

const isDuplicateKeyError = (error: unknown): error is MongoErrorLike =>
  typeof error === "object" &&
  error !== null &&
  (error as MongoErrorLike).code === 11000;

const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((e) => e.message);
    return new BadRequestError("Validation failed.", details);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new BadRequestError(`Invalid value for '${error.path}'.`);
  }

  if (isDuplicateKeyError(error)) {
    return new ConflictError("A record with these values already exists.");
  }

  return new AppError("Internal server error.", 500, { expose: false });
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const appError = normalizeError(error);

  logger.error(
    { err: error, method: req.method, path: req.originalUrl, statusCode: appError.statusCode },
    "Request failed",
  );

  const response: Record<string, unknown> = {
    error: appError.expose ? appError.message : "Internal server error.",
  };

  if (appError.expose && appError.details !== undefined) {
    response.details = appError.details;
  }

  res.status(appError.statusCode).json(response);
};
