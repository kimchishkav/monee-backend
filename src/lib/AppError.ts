export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }

  static badRequest(message: string) {
    return new AppError(message, 400);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }

  static notFound(message = "Not found") {
    return new AppError(message, 404);
  }

  static conflict(message: string) {
    return new AppError(message, 409);
  }

  static unprocessable(message: string) {
    return new AppError(message, 422);
  }
}
