export const EXPENSE_CATEGORIES = [
  "Еда",
  "Транспорт",
  "Одежда",
  "Здоровье",
  "Развлечения",
  "Образование",
  "Коммуналка",
  "Прочее",
] as const;

export const INCOME_CATEGORIES = ["Зарплата", "Подарок", "Прочее"] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
