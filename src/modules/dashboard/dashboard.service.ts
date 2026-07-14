import { prisma } from "../../config/prisma";
import { getMonthBounds, getPreviousMonthBounds } from "../../lib/date-range";
import { percentChange, toMoney } from "../../lib/money";
import { toTransactionDto } from "../transactions/transactions.service";

async function sumByType(
  userId: number,
  type: "INCOME" | "EXPENSE",
  start: Date,
  end: Date,
): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: { userId, type, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return toMoney(result._sum.amount);
}

export async function getDashboard(userId: number) {
  const now = new Date();
  const current = getMonthBounds(now);
  const previous = getPreviousMonthBounds(now);

  const [
    accounts,
    currentIncome,
    currentExpense,
    previousIncome,
    previousExpense,
    expenseRows,
    lastTransactions,
    user,
  ] = await Promise.all([
    prisma.account.findMany({ where: { userId } }),
    sumByType(userId, "INCOME", current.start, current.end),
    sumByType(userId, "EXPENSE", current.start, current.end),
    sumByType(userId, "INCOME", previous.start, previous.end),
    sumByType(userId, "EXPENSE", previous.start, previous.end),
    prisma.transaction.findMany({
      where: { userId, type: "EXPENSE", date: { gte: current.start, lt: current.end } },
      select: { amount: true, date: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);

  const activeBalance = accounts
    .filter((a) => !a.isFrozen)
    .reduce((sum, a) => sum + Number(a.balance), 0);
  const frozenBalance = accounts
    .filter((a) => a.isFrozen)
    .reduce((sum, a) => sum + Number(a.balance), 0);

  const expensesByDayMap = new Map<number, number>();
  for (const row of expenseRows) {
    const day = row.date.getDate();
    expensesByDayMap.set(day, (expensesByDayMap.get(day) ?? 0) + Number(row.amount));
  }
  const daysInMonth = new Date(current.start.getFullYear(), current.start.getMonth() + 1, 0).getDate();
  const expensesByDay = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return { day, total: Math.round((expensesByDayMap.get(day) ?? 0) * 100) / 100 };
  });

  const spendingLimit =
    user.monthlySpendingLimit === null ? null : toMoney(user.monthlySpendingLimit);

  return {
    activeBalance: Math.round(activeBalance * 100) / 100,
    frozenBalance: Math.round(frozenBalance * 100) / 100,
    currentMonth: { income: currentIncome, expense: currentExpense },
    previousMonth: { income: previousIncome, expense: previousExpense },
    incomeChangePercent: percentChange(currentIncome, previousIncome),
    expenseChangePercent: percentChange(currentExpense, previousExpense),
    expensesByDay,
    lastTransactions: lastTransactions.map(toTransactionDto),
    spendingLimit,
    currentMonthExpense: currentExpense,
    spendingLimitExceeded: spendingLimit !== null && currentExpense > spendingLimit,
  };
}
