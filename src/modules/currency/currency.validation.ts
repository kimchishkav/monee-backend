import { z } from "zod";
import { CONVERTER_CURRENCIES } from "../../constants/currencies";

export const getRatesQuerySchema = z.object({
  base: z.enum(CONVERTER_CURRENCIES).default("KZT"),
});

export type GetRatesQuery = z.infer<typeof getRatesQuerySchema>;
