import { z } from "zod";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../constants/categories";

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);

export const createTransactionSchema = z
  .object({
    type: transactionTypeSchema,
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    accountId: z.coerce.number().int().positive(),
    toAccountId: z.coerce.number().int().positive().optional(),
    category: z.string().trim().min(1).max(50).optional(),
    note: z.string().trim().max(1000).optional(),
    date: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "EXPENSE") {
      if (!data.category || !(EXPENSE_CATEGORIES as readonly string[]).includes(data.category)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `category must be one of: ${EXPENSE_CATEGORIES.join(", ")}`,
          path: ["category"],
        });
      }
      if (data.toAccountId !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "toAccountId is not allowed for EXPENSE",
          path: ["toAccountId"],
        });
      }
    }

    if (data.type === "INCOME") {
      if (!data.category || !(INCOME_CATEGORIES as readonly string[]).includes(data.category)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `category must be one of: ${INCOME_CATEGORIES.join(", ")}`,
          path: ["category"],
        });
      }
      if (data.toAccountId !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "toAccountId is not allowed for INCOME",
          path: ["toAccountId"],
        });
      }
    }

    if (data.type === "TRANSFER") {
      if (data.category !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "category is not allowed for TRANSFER",
          path: ["category"],
        });
      }
      if (data.toAccountId === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "toAccountId is required for TRANSFER",
          path: ["toAccountId"],
        });
      } else if (data.toAccountId === data.accountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "toAccountId must be different from accountId",
          path: ["toAccountId"],
        });
      }
    }
  });

export const listTransactionsQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  category: z.string().optional(),
  accountId: z.coerce.number().int().positive().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
