import type { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export async function getDashboardHandler(req: Request, res: Response) {
  const data = await dashboardService.getDashboard(req.userId);
  res.status(200).json({ data });
}
