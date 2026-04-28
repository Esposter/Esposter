import { z } from "zod";

export enum AdminActionType {
  CreateBan = "CreateBan",
  ForceMute = "ForceMute",
  ForceUnmute = "ForceUnmute",
  KickFromRoom = "KickFromRoom",
  KickFromVoice = "KickFromVoice",
  SoftBan = "SoftBan",
  TimeoutUser = "TimeoutUser",
  Warn = "Warn",
}

export const adminActionTypeSchema = z.enum(AdminActionType) satisfies z.ZodType<AdminActionType>;
