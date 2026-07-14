import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import {
  deleteAvatarHandler,
  getProfileHandler,
  updateProfileHandler,
  uploadAvatarHandler,
} from "./profile.controller";
import { updateProfileSchema, uploadAvatarSchema } from "./profile.validation";

export const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get("/", asyncHandler(getProfileHandler));
profileRouter.patch("/", validateBody(updateProfileSchema), asyncHandler(updateProfileHandler));
profileRouter.post("/avatar", validateBody(uploadAvatarSchema), asyncHandler(uploadAvatarHandler));
profileRouter.delete("/avatar", asyncHandler(deleteAvatarHandler));
