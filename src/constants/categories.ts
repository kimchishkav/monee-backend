export const EXPENSE_CATEGORIES = [
  "Еда",
  "Транспорт",
  "Одежда",
  "Красота и здоровье",
  "Развлечения",
  "Образование",
  "Коммуналка",
  "Подписки",
  "Рассрочки",
  "Церковь",
  "Косметика",
  "Бытовые расходы",
  "Прочее",
] as const;

export const INCOME_CATEGORIES = [
  "Зарплата",
  "Подарок",
  "Проценты по депозиту",
  "Долг",
  "Прочее",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
