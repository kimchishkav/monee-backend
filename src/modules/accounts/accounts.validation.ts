import { z } from "zod";

export const accountTypeSchema = z.enum(["CARD", "CASH", "DEPOSIT"]);

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  type: accountTypeSchema,
  initialBalance: z.coerce.number().finite(),
  notes: z.string().trim().max(1000).optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  type: accountTypeSchema.optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  balance: z.coerce.number().finite().optional(),
});

export const unfreezeAccountSchema = z.object({
  targetAccountId: z.coerce.number().int().positive(),
});

export const listAccountsQuerySchema = z.object({
  status: z.enum(["active", "frozen"]).optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type UnfreezeAccountInput = z.infer<typeof unfreezeAccountSchema>;
