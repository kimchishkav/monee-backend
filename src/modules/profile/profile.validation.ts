import { z } from "zod";
import { CURRENCIES } from "../../constants/currencies";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  currency: z.enum(CURRENCIES).optional(),
  monthlySpendingLimit: z.coerce.number().nonnegative().nullable().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export const uploadAvatarSchema = z.object({
  imageBase64: z
    .string()
    .regex(/^data:image\/(png|jpe?g|gif|webp);base64,/, "imageBase64 must be a base64 image data URI"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>;
