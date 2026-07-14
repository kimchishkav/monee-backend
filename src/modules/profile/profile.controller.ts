import type { Request, Response } from "express";
import * as profileService from "./profile.service";

export async function getProfileHandler(req: Request, res: Response) {
  const data = await profileService.getProfile(req.userId);
  res.status(200).json({ data });
}

export async function updateProfileHandler(req: Request, res: Response) {
  const data = await profileService.updateProfile(req.userId, req.body);
  res.status(200).json({ data });
}

export async function uploadAvatarHandler(req: Request, res: Response) {
  const data = await profileService.uploadAvatar(req.userId, req.body);
  res.status(200).json({ data });
}

export async function deleteAvatarHandler(req: Request, res: Response) {
  const data = await profileService.deleteAvatar(req.userId);
  res.status(200).json({ data });
}
