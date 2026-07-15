export const CURRENCIES = ["USD", "EUR", "KZT", "RUB", "GBP"] as const;

export type Currency = (typeof CURRENCIES)[number];

// Currencies the /currency/rates endpoint will fetch and return.
// Kept as a small fixed allowlist rather than passing through all ~160
// currencies the upstream rate provider supports.
export const CONVERTER_CURRENCIES = ["USD", "EUR", "CNY", "KZT", "RUB", "KRW", "UZS", "KGS"] as const;

export type ConverterCurrency = (typeof CONVERTER_CURRENCIES)[number];
