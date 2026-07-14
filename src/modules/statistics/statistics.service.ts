import { prisma } from "../../config/prisma";
import { formatMonthLabel, getLastNMonths, parseMonthParam } from "../../lib/date-range";
import { toMoney } from "../../lib/money";
import type { ByCategoryQuery, SummaryQuery, TrendQuery } from "./statistics.validation";

async function sumByType(
  userId: number,
  type: "INCOME" | "EXPENSE",
  start: Date,
  end: Date,
  accountId?: number,
): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type,
      date: { gte: start, lt: end },
      ...(accountId ? { accountId } : {}),
    },
    _sum: { amount: true },
  });
  return toMoney(result._sum.amount);
}

export async function getSummary(userId: number, query: SummaryQuery) {
  const { start, end } = parseMonthParam(query.month, new Date());
  const [income, expense] = await Promise.all([
    sumByType(userId, "INCOME", start, end, query.accountId),
    sumByType(userId, "EXPENSE", start, end, query.accountId),
  ]);
  return { income, expense };
}

export async function getByCategory(userId: number, query: ByCategoryQuery) {
  const { start, end } = parseMonthParam(query.month, new Date());
  const rows = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      userId,
      type: query.type,
      date: { gte: start, lt: end },
      ...(query.accountId ? { accountId: query.accountId } : {}),
    },
    _sum: { amount: true },
  });

  return rows
    .filter((row) => row.category !== null)
    .map((row) => ({ category: row.category as string, total: toMoney(row._sum.amount) }))
    .sort((a, b) => b.total - a.total);
}

export async function getTrend(userId: number, query: TrendQuery) {
  const ranges = getLastNMonths(new Date(), query.months);
  return Promise.all(
    ranges.map(async (range) => {
      const [income, expense] = await Promise.all([
        sumByType(userId, "INCOME", range.start, range.end, query.accountId),
        sumByType(userId, "EXPENSE", range.start, range.end, query.accountId),
      ]);
      return { month: formatMonthLabel(range), income, expense };
    }),
  );
}
