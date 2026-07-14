import type { Request, Response } from "express";
import * as accountsService from "./accounts.service";

export async function listAccountsHandler(req: Request, res: Response) {
  const { status } = req.query as { status?: "active" | "frozen" };
  const data = await accountsService.listAccounts(req.userId, status);
  res.status(200).json({ data });
}

export async function getAccountHandler(req: Request, res: Response) {
  const data = await accountsService.getAccount(req.userId, Number(req.params.id));
  res.status(200).json({ data });
}

export async function createAccountHandler(req: Request, res: Response) {
  const data = await accountsService.createAccount(req.userId, req.body);
  res.status(201).json({ data });
}

export async function updateAccountHandler(req: Request, res: Response) {
  const data = await accountsService.updateAccount(req.userId, Number(req.params.id), req.body);
  res.status(200).json({ data });
}

export async function deleteAccountHandler(req: Request, res: Response) {
  await accountsService.deleteAccount(req.userId, Number(req.params.id));
  res.status(204).send();
}

export async function freezeAccountHandler(req: Request, res: Response) {
  const data = await accountsService.freezeAccount(req.userId, Number(req.params.id));
  res.status(200).json({ data });
}

export async function unfreezeAccountHandler(req: Request, res: Response) {
  const data = await accountsService.unfreezeAccount(req.userId, Number(req.params.id), req.body);
  res.status(200).json({ data });
}
