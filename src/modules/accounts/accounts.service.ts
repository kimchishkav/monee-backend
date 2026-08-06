import type { Account } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../lib/AppError";
import { toMoney } from "../../lib/money";
import type {
  CreateAccountInput,
  UnfreezeAccountInput,
  UpdateAccountInput,
} from "./accounts.validation";

export interface AccountDto {
  id: number;
  name: string;
  type: string;
  balance: number;
  notes: string | null;
  isFrozen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toAccountDto(account: Account): AccountDto {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    balance: toMoney(account.balance),
    notes: account.notes,
    isFrozen: account.isFrozen,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

export async function getOwnedAccount(userId: number, accountId: number): Promise<Account> {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== userId) {
    throw AppError.notFound("Account not found");
  }
  return account;
}

export async function listAccounts(
  userId: number,
  status?: "active" | "frozen",
): Promise<AccountDto[]> {
  const accounts = await prisma.account.findMany({
    where: {
      userId,
      ...(status ? { isFrozen: status === "frozen" } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  return accounts.map(toAccountDto);
}

export async function getAccount(userId: number, accountId: number): Promise<AccountDto> {
  const account = await getOwnedAccount(userId, accountId);
  return toAccountDto(account);
}

export async function createAccount(
  userId: number,
  input: CreateAccountInput,
): Promise<AccountDto> {
  const account = await prisma.account.create({
    data: {
      userId,
      name: input.name,
      type: input.type,
      balance: input.initialBalance,
      notes: input.notes ?? null,
    },
  });
  return toAccountDto(account);
}

export async function updateAccount(
  userId: number,
  accountId: number,
  input: UpdateAccountInput,
): Promise<AccountDto> {
  await getOwnedAccount(userId, accountId);
  const account = await prisma.account.update({
    where: { id: accountId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.balance !== undefined ? { balance: input.balance } : {}),
    },
  });
  return toAccountDto(account);
}

export async function deleteAccount(userId: number, accountId: number): Promise<void> {
  await getOwnedAccount(userId, accountId);
  await prisma.$transaction([
    prisma.transaction.deleteMany({
      where: { OR: [{ accountId }, { toAccountId: accountId }] },
    }),
    prisma.account.delete({ where: { id: accountId } }),
  ]);
}

export async function freezeAccount(userId: number, accountId: number): Promise<AccountDto> {
  const account = await getOwnedAccount(userId, accountId);
  if (account.isFrozen) {
    throw AppError.conflict("Account is already frozen");
  }
  const updated = await prisma.account.update({
    where: { id: accountId },
    data: { isFrozen: true },
  });
  return toAccountDto(updated);
}

export async function unfreezeAccount(
  userId: number,
  accountId: number,
  input: UnfreezeAccountInput,
): Promise<AccountDto> {
  const account = await getOwnedAccount(userId, accountId);
  if (!account.isFrozen) {
    throw AppError.conflict("Account is not frozen");
  }
  if (input.targetAccountId === accountId) {
    throw AppError.badRequest("Target account must be different from the frozen account");
  }
  const targetAccount = await getOwnedAccount(userId, input.targetAccountId);
  if (targetAccount.isFrozen) {
    throw AppError.unprocessable("Target account is frozen");
  }

  const balance = Number(account.balance);

  const ops = [];
  if (balance > 0) {
    ops.push(
      prisma.transaction.create({
        data: {
          userId,
          type: "TRANSFER",
          amount: account.balance,
          category: null,
          accountId: account.id,
          toAccountId: targetAccount.id,
          note: "Unfreeze transfer",
          date: new Date(),
        },
      }),
    );
    ops.push(
      prisma.account.update({
        where: { id: targetAccount.id },
        data: { balance: { increment: account.balance } },
      }),
    );
  }
  const unfreezeOp = prisma.account.update({
    where: { id: accountId },
    data: { balance: 0, isFrozen: false },
  });

  const results = await prisma.$transaction([...ops, unfreezeOp]);
  const unfrozen = results[results.length - 1] as Account;

  return toAccountDto(unfrozen);
}
