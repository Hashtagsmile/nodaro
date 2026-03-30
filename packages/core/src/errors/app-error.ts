export class AppError extends Error {
  public readonly statusCode: number;
  public readonly expose: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    options?: { expose?: boolean; details?: unknown },
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.expose = options?.expose ?? statusCode < 500;
    this.details = options?.details;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, { details });
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, { details });
    this.name = "ConflictError";
  }
}
