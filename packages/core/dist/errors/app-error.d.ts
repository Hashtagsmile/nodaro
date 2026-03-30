export declare class AppError extends Error {
    readonly statusCode: number;
    readonly expose: boolean;
    readonly details?: unknown;
    constructor(message: string, statusCode?: number, options?: {
        expose?: boolean;
        details?: unknown;
    });
}
export declare class BadRequestError extends AppError {
    constructor(message: string, details?: unknown);
}
export declare class NotFoundError extends AppError {
    constructor(message: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string, details?: unknown);
}
//# sourceMappingURL=app-error.d.ts.map