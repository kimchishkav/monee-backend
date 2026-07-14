import { prisma } from "../../config/prisma";
import { AppError } from "../../lib/AppError";
import { toUserDto, type UserDto } from "../../lib/userDto";
import type { UpdateProfileInput, UploadAvatarInput } from "./profile.validation";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export async function getProfile(userId: number): Promise<UserDto> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return toUserDto(user);
}

export async function updateProfile(userId: number, input: UpdateProfileInput): Promise<UserDto> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.monthlySpendingLimit !== undefined
        ? { monthlySpendingLimit: input.monthlySpendingLimit }
        : {}),
      ...(input.theme !== undefined ? { theme: input.theme } : {}),
    },
  });
  return toUserDto(user);
}

export async function uploadAvatar(userId: number, input: UploadAvatarInput): Promise<UserDto> {
  const base64Payload = input.imageBase64.split(",")[1] ?? "";
  const approxBytes = Math.ceil((base64Payload.length * 3) / 4);
  if (approxBytes > MAX_AVATAR_BYTES) {
    throw AppError.unprocessable("Avatar image must be smaller than 2MB");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarBase64: input.imageBase64 },
  });
  return toUserDto(user);
}

export async function deleteAvatar(userId: number): Promise<UserDto> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarBase64: null },
  });
  return toUserDto(user);
}
