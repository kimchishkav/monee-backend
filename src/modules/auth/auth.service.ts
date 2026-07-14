import { prisma } from "../../config/prisma";
import { AppError } from "../../lib/AppError";
import { comparePassword, hashPassword } from "../../lib/bcrypt";
import { signToken } from "../../lib/jwt";
import { toUserDto, type UserDto } from "../../lib/userDto";
import type { LoginInput, RegisterInput } from "./auth.validation";

export interface AuthResult {
  user: UserDto;
  token: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict("Email is already registered");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
  });

  const token = signToken({ userId: user.id });
  return { user: toUserDto(user), token };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const token = signToken({ userId: user.id });
  return { user: toUserDto(user), token };
}

export async function getMe(userId: number): Promise<UserDto> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound("User not found");
  }
  return toUserDto(user);
}
