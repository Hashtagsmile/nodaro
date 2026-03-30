"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const app_error_1 = require("../errors/app-error");
const logger_1 = require("../utils/logger");
const isDuplicateKeyError = (error) => typeof error === "object" &&
    error !== null &&
    error.code === 11000;
const normalizeError = (error) => {
    if (error instanceof app_error_1.AppError)
        return error;
    if (error instanceof mongoose_1.default.Error.ValidationError) {
        const details = Object.values(error.errors).map((e) => e.message);
        return new app_error_1.BadRequestError("Validation failed.", details);
    }
    if (error instanceof mongoose_1.default.Error.CastError) {
        return new app_error_1.BadRequestError(`Invalid value for '${error.path}'.`);
    }
    if (isDuplicateKeyError(error)) {
        return new app_error_1.ConflictError("A record with these values already exists.");
    }
    return new app_error_1.AppError("Internal server error.", 500, { expose: false });
};
const errorHandler = (error, req, res, _next) => {
    const appError = normalizeError(error);
    logger_1.logger.error({ err: error, method: req.method, path: req.originalUrl, statusCode: appError.statusCode }, "Request failed");
    const response = {
        error: appError.expose ? appError.message : "Internal server error.",
    };
    if (appError.expose && appError.details !== undefined) {
        response.details = appError.details;
    }
    res.status(appError.statusCode).json(response);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map