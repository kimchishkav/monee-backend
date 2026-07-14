import type { Request, Response } from "express";
import * as transactionsService from "./transactions.service";
import type { ListTransactionsQuery } from "./transactions.validation";

export async function listTransactionsHandler(req: Request, res: Response) {
  const query = req.query as unknown as ListTransactionsQuery;
  const result = await transactionsService.listTransactions(req.userId, query);
  res.status(200).json(result);
}

export async function getTransactionHandler(req: Request, res: Response) {
  const data = await transactionsService.getTransaction(req.userId, Number(req.params.id));
  res.status(200).json({ data });
}

export async function createTransactionHandler(req: Request, res: Response) {
  const data = await transactionsService.createTransaction(req.userId, req.body);
  res.status(201).json({ data });
}

export async function deleteTransactionHandler(req: Request, res: Response) {
  await transactionsService.deleteTransaction(req.userId, Number(req.params.id));
  res.status(204).send();
}
