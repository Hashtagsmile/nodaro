"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.NotFoundError = exports.BadRequestError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, options) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.expose = options?.expose ?? statusCode < 500;
        this.details = options?.details;
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message, details) {
        super(message, 400, { details });
        this.name = "BadRequestError";
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message, details) {
        super(message, 409, { details });
        this.name = "ConflictError";
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=app-error.js.map