import { AdminActionType } from "@esposter/db-schema";

export const AdminActionColorMap = {
  [AdminActionType.CreateBan]: "error",
  [AdminActionType.ForceMute]: "warning",
  [AdminActionType.ForceUnmute]: "success",
  [AdminActionType.KickFromRoom]: "error",
  [AdminActionType.KickFromCall]: "warning",
  [AdminActionType.SoftBan]: "error",
  [AdminActionType.TimeoutUser]: "warning",
  [AdminActionType.Warn]: "warning",
} as const satisfies Record<AdminActionType, string>;
