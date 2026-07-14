import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateQuery } from "../../middleware/validate.middleware";
import { getRatesHandler } from "./currency.controller";
import { getRatesQuerySchema } from "./currency.validation";

export const currencyRouter = Router();

currencyRouter.use(authMiddleware);
currencyRouter.get("/rates", validateQuery(getRatesQuerySchema), asyncHandler(getRatesHandler));
