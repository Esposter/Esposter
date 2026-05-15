import { AdminActionType } from "@esposter/db-schema";

export const AdminActionColorMap = {
  [AdminActionType.CreateBan]: "error",
  [AdminActionType.ForceMute]: "warning",
  [AdminActionType.ForceUnmute]: "success",
  [AdminActionType.KickFromCall]: "warning",
  [AdminActionType.KickFromRoom]: "error",
  [AdminActionType.SoftBan]: "error",
  [AdminActionType.StopScreenShare]: "warning",
  [AdminActionType.TimeoutUser]: "warning",
  [AdminActionType.Warn]: "warning",
} as const satisfies Record<AdminActionType, string>;
