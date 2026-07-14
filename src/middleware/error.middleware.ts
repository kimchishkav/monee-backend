import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/AppError";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { message: err.message } });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { message: "Internal server error" } });
}
