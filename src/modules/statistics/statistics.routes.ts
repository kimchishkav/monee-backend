import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateQuery } from "../../middleware/validate.middleware";
import { getByCategoryHandler, getSummaryHandler, getTrendHandler } from "./statistics.controller";
import { byCategoryQuerySchema, summaryQuerySchema, trendQuerySchema } from "./statistics.validation";

export const statisticsRouter = Router();

statisticsRouter.use(authMiddleware);

statisticsRouter.get("/summary", validateQuery(summaryQuerySchema), asyncHandler(getSummaryHandler));
statisticsRouter.get(
  "/by-category",
  validateQuery(byCategoryQuerySchema),
  asyncHandler(getByCategoryHandler),
);
statisticsRouter.get("/trend", validateQuery(trendQuerySchema), asyncHandler(getTrendHandler));
