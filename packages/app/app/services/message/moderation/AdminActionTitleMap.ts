import { AdminActionType } from "@esposter/db-schema";

export const AdminActionTitleMap = {
  [AdminActionType.CreateBan]: "Ban",
  [AdminActionType.KickFromRoom]: "Kick",
  [AdminActionType.SoftBan]: "Soft Ban",
  [AdminActionType.TimeoutUser]: "Timeout",
  [AdminActionType.Warn]: "Warn",
} as const satisfies Partial<Record<AdminActionType, string>>;
