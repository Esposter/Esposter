import { z } from "zod";

export const AdminActionType = {
  CreateBan: "CreateBan",
  ForceMute: "ForceMute",
  ForceUnmute: "ForceUnmute",
  KickFromCall: "KickFromCall",
  KickFromRoom: "KickFromRoom",
  SoftBan: "SoftBan",
  StopScreenShare: "StopScreenShare",
  TimeoutUser: "TimeoutUser",
  Warn: "Warn",
} as const;
export type AdminActionType = (typeof AdminActionType)[keyof typeof AdminActionType];

export const adminActionTypeSchema = z.enum(AdminActionType) satisfies z.ZodType<AdminActionType>;

export const AdminActionTypes: readonly AdminActionType[] = Object.values(AdminActionType);
