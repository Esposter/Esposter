import { z } from "zod";

export enum AdminActionType {
  BanUser = "BanUser",
  ForceMute = "ForceMute",
  ForceUnmute = "ForceUnmute",
  KickFromRoom = "KickFromRoom",
  KickFromVoice = "KickFromVoice",
  TimeoutUser = "TimeoutUser",
}

export const adminActionTypeSchema = z.enum(AdminActionType) satisfies z.ZodType<AdminActionType>;
