import { AppError } from "../../lib/AppError";
import { CONVERTER_CURRENCIES, type ConverterCurrency } from "../../constants/currencies";

interface ExchangeRateApiResponse {
  result: string;
  base_code: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
}

interface CachedRates {
  base: ConverterCurrency;
  rates: Record<string, number>;
  updatedAt: string;
  fetchedAt: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — upstream data only refreshes daily anyway
const cache = new Map<string, CachedRates>();

export async function getRates(base: ConverterCurrency) {
  const cached = cache.get(base);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { base: cached.base, rates: cached.rates, updatedAt: cached.updatedAt };
  }

  let response: Response;
  try {
    response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
  } catch {
    throw AppError.badRequest("Не удалось получить курсы валют, попробуйте позже");
  }

  if (!response.ok) {
    throw AppError.badRequest("Не удалось получить курсы валют, попробуйте позже");
  }

  const data = (await response.json()) as ExchangeRateApiResponse;
  if (data.result !== "success") {
    throw AppError.badRequest("Не удалось получить курсы валют, попробуйте позже");
  }

  const rates: Record<string, number> = {};
  for (const currency of CONVERTER_CURRENCIES) {
    if (typeof data.rates[currency] === "number") {
      rates[currency] = data.rates[currency];
    }
  }

  const result: CachedRates = {
    base,
    rates,
    updatedAt: data.time_last_update_utc,
    fetchedAt: Date.now(),
  };
  cache.set(base, result);

  return { base: result.base, rates: result.rates, updatedAt: result.updatedAt };
}
