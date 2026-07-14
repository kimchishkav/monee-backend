import type { User } from "@prisma/client";
import { toMoney } from "./money";

export interface UserDto {
  id: number;
  name: string;
  email: string;
  currency: string;
  monthlySpendingLimit: number | null;
  theme: string;
  avatarBase64: string | null;
  createdAt: Date;
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    monthlySpendingLimit:
      user.monthlySpendingLimit === null ? null : toMoney(user.monthlySpendingLimit),
    theme: user.theme,
    avatarBase64: user.avatarBase64,
    createdAt: user.createdAt,
  };
}
