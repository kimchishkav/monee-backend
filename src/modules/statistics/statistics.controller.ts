import type { Request, Response } from "express";
import * as statisticsService from "./statistics.service";
import type { ByCategoryQuery, SummaryQuery, TrendQuery } from "./statistics.validation";

export async function getSummaryHandler(req: Request, res: Response) {
  const data = await statisticsService.getSummary(req.userId, req.query as unknown as SummaryQuery);
  res.status(200).json({ data });
}

export async function getByCategoryHandler(req: Request, res: Response) {
  const data = await statisticsService.getByCategory(
    req.userId,
    req.query as unknown as ByCategoryQuery,
  );
  res.status(200).json({ data });
}

export async function getTrendHandler(req: Request, res: Response) {
  const data = await statisticsService.getTrend(req.userId, req.query as unknown as TrendQuery);
  res.status(200).json({ data });
}
