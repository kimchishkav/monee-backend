import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateBody, validateQuery } from "../../middleware/validate.middleware";
import {
  createTransactionHandler,
  deleteTransactionHandler,
  getTransactionHandler,
  listTransactionsHandler,
} from "./transactions.controller";
import { createTransactionSchema, listTransactionsQuerySchema } from "./transactions.validation";

export const transactionsRouter = Router();

transactionsRouter.use(authMiddleware);

transactionsRouter.get(
  "/",
  validateQuery(listTransactionsQuerySchema),
  asyncHandler(listTransactionsHandler),
);
transactionsRouter.post(
  "/",
  validateBody(createTransactionSchema),
  asyncHandler(createTransactionHandler),
);
transactionsRouter.get("/:id", asyncHandler(getTransactionHandler));
transactionsRouter.delete("/:id", asyncHandler(deleteTransactionHandler));
