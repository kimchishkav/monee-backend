import type { Request, Response } from "express";
import * as currencyService from "./currency.service";
import type { GetRatesQuery } from "./currency.validation";

export async function getRatesHandler(req: Request, res: Response) {
  const { base } = req.query as unknown as GetRatesQuery;
  const data = await currencyService.getRates(base);
  res.status(200).json({ data });
}
