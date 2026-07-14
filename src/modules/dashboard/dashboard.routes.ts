import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getDashboardHandler } from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);
dashboardRouter.get("/", asyncHandler(getDashboardHandler));
