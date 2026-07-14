export const CURRENCIES = ["USD", "EUR", "KZT", "RUB", "GBP"] as const;

export type Currency = (typeof CURRENCIES)[number];
