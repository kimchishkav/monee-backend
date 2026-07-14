import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateBody, validateQuery } from "../../middleware/validate.middleware";
import {
  createAccountHandler,
  deleteAccountHandler,
  freezeAccountHandler,
  getAccountHandler,
  listAccountsHandler,
  unfreezeAccountHandler,
  updateAccountHandler,
} from "./accounts.controller";
import {
  createAccountSchema,
  listAccountsQuerySchema,
  unfreezeAccountSchema,
  updateAccountSchema,
} from "./accounts.validation";

export const accountsRouter = Router();

accountsRouter.use(authMiddleware);

accountsRouter.get("/", validateQuery(listAccountsQuerySchema), asyncHandler(listAccountsHandler));
accountsRouter.post("/", validateBody(createAccountSchema), asyncHandler(createAccountHandler));
accountsRouter.get("/:id", asyncHandler(getAccountHandler));
accountsRouter.patch("/:id", validateBody(updateAccountSchema), asyncHandler(updateAccountHandler));
accountsRouter.delete("/:id", asyncHandler(deleteAccountHandler));
accountsRouter.post("/:id/freeze", asyncHandler(freezeAccountHandler));
accountsRouter.post(
  "/:id/unfreeze",
  validateBody(unfreezeAccountSchema),
  asyncHandler(unfreezeAccountHandler),
);
