export interface DateRange {
  start: Date;
  end: Date;
}

/** Start (inclusive) and end (exclusive) bounds for the calendar month containing `date`. */
export function getMonthBounds(date: Date): DateRange {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export function getPreviousMonthBounds(date: Date): DateRange {
  const prevMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return getMonthBounds(prevMonthDate);
}

/** Returns `count` month bounds ending with the month containing `date`, oldest first. */
export function getLastNMonths(date: Date, count: number): DateRange[] {
  const months: DateRange[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const monthDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push(getMonthBounds(monthDate));
  }
  return months;
}

export function formatMonthLabel(range: DateRange): string {
  const year = range.start.getFullYear();
  const month = String(range.start.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Parses "YYYY-MM" into month bounds; falls back to the month containing `now` if omitted/invalid. */
export function parseMonthParam(monthParam: string | undefined, now: Date): DateRange {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split("-").map(Number);
    return getMonthBounds(new Date(year, month - 1, 1));
  }
  return getMonthBounds(now);
}
