import type { Transaction } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../lib/AppError";
import { toMoney } from "../../lib/money";
import { getOwnedAccount } from "../accounts/accounts.service";
import type { CreateTransactionInput, ListTransactionsQuery } from "./transactions.validation";

export interface TransactionDto {
  id: number;
  type: string;
  amount: number;
  category: string | null;
  accountId: number;
  toAccountId: number | null;
  note: string | null;
  date: Date;
  createdAt: Date;
}

export function toTransactionDto(tx: Transaction): TransactionDto {
  return {
    id: tx.id,
    type: tx.type,
    amount: toMoney(tx.amount),
    category: tx.category,
    accountId: tx.accountId,
    toAccountId: tx.toAccountId,
    note: tx.note,
    date: tx.date,
    createdAt: tx.createdAt,
  };
}

export async function listTransactions(userId: number, query: ListTransactionsQuery) {
  const where = {
    userId,
    ...(query.type ? { type: query.type } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.accountId
      ? { OR: [{ accountId: query.accountId }, { toAccountId: query.accountId }] }
      : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          date: {
            ...(query.dateFrom ? { gte: query.dateFrom } : {}),
            ...(query.dateTo ? { lte: query.dateTo } : {}),
          },
        }
      : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions.map(toTransactionDto),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getTransaction(userId: number, transactionId: number): Promise<TransactionDto> {
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!tx || tx.userId !== userId) {
    throw AppError.notFound("Transaction not found");
  }
  return toTransactionDto(tx);
}

export async function createTransaction(
  userId: number,
  input: CreateTransactionInput,
): Promise<TransactionDto> {
  const account = await getOwnedAccount(userId, input.accountId);
  if (account.isFrozen) {
    throw AppError.unprocessable("Account is frozen");
  }

  let toAccount = null;
  if (input.type === "TRANSFER") {
    toAccount = await getOwnedAccount(userId, input.toAccountId!);
    if (toAccount.isFrozen) {
      throw AppError.unprocessable("Destination account is frozen");
    }
  }

  const date = input.date ?? new Date();
  const ops = [];

  ops.push(
    prisma.transaction.create({
      data: {
        userId,
        type: input.type,
        amount: input.amount,
        category: input.type === "TRANSFER" ? null : (input.category ?? null),
        accountId: input.accountId,
        toAccountId: input.type === "TRANSFER" ? input.toAccountId : null,
        note: input.note ?? null,
        date,
      },
    }),
  );

  if (input.type === "INCOME") {
    ops.push(
      prisma.account.update({
        where: { id: input.accountId },
        data: { balance: { increment: input.amount } },
      }),
    );
  } else if (input.type === "EXPENSE") {
    ops.push(
      prisma.account.update({
        where: { id: input.accountId },
        data: { balance: { decrement: input.amount } },
      }),
    );
  } else {
    ops.push(
      prisma.account.update({
        where: { id: input.accountId },
        data: { balance: { decrement: input.amount } },
      }),
    );
    ops.push(
      prisma.account.update({
        where: { id: input.toAccountId! },
        data: { balance: { increment: input.amount } },
      }),
    );
  }

  const [createdTx] = await prisma.$transaction(ops);
  return toTransactionDto(createdTx as Transaction);
}

export async function deleteTransaction(userId: number, transactionId: number): Promise<void> {
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!tx || tx.userId !== userId) {
    throw AppError.notFound("Transaction not found");
  }

  const ops = [];

  if (tx.type === "INCOME") {
    ops.push(
      prisma.account.update({
        where: { id: tx.accountId },
        data: { balance: { decrement: tx.amount } },
      }),
    );
  } else if (tx.type === "EXPENSE") {
    ops.push(
      prisma.account.update({
        where: { id: tx.accountId },
        data: { balance: { increment: tx.amount } },
      }),
    );
  } else {
    ops.push(
      prisma.account.update({
        where: { id: tx.accountId },
        data: { balance: { increment: tx.amount } },
      }),
    );
    ops.push(
      prisma.account.update({
        where: { id: tx.toAccountId! },
        data: { balance: { decrement: tx.amount } },
      }),
    );
  }

  ops.push(prisma.transaction.delete({ where: { id: transactionId } }));

  await prisma.$transaction(ops);
}
