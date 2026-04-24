import { z } from "zod";

export enum AdminActionType {
  CreateBan = "CreateBan",
  ForceMute = "ForceMute",
  ForceUnmute = "ForceUnmute",
  KickFromRoom = "KickFromRoom",
  KickFromVoice = "KickFromVoice",
  TimeoutUser = "TimeoutUser",
}

export const adminActionTypeSchema = z.enum(AdminActionType) satisfies z.ZodType<AdminActionType>;
