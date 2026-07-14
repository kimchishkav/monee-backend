import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { loginHandler, meHandler, registerHandler } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), asyncHandler(registerHandler));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(loginHandler));
authRouter.get("/me", authMiddleware, asyncHandler(meHandler));
