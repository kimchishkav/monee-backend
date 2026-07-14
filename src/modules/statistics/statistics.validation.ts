import { z } from "zod";

const monthParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "month must be in YYYY-MM format")
  .optional();

export const summaryQuerySchema = z.object({
  month: monthParamSchema,
  accountId: z.coerce.number().int().positive().optional(),
});

export const byCategoryQuerySchema = z.object({
  month: monthParamSchema,
  accountId: z.coerce.number().int().positive().optional(),
  type: z.enum(["EXPENSE", "INCOME"]),
});

export const trendQuerySchema = z.object({
  months: z.coerce.number().int().positive().max(24).default(6),
  accountId: z.coerce.number().int().positive().optional(),
});

export type SummaryQuery = z.infer<typeof summaryQuerySchema>;
export type ByCategoryQuery = z.infer<typeof byCategoryQuerySchema>;
export type TrendQuery = z.infer<typeof trendQuerySchema>;
