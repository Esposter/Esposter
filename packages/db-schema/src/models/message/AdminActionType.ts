import { z } from "zod";

export enum AdminActionType {
  CreateBan = "CreateBan",
  ForceMute = "ForceMute",
  ForceUnmute = "ForceUnmute",
  KickFromCall = "KickFromCall",
  KickFromRoom = "KickFromRoom",
  SoftBan = "SoftBan",
  TimeoutUser = "TimeoutUser",
  Warn = "Warn",
}

export const adminActionTypeSchema = z.enum(AdminActionType) satisfies z.ZodType<AdminActionType>;
