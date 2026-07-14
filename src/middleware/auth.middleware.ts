import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/AppError";
import { verifyToken } from "../lib/jwt";

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or invalid Authorization header");
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
}
