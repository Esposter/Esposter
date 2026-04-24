import { AdminActionType } from "@esposter/db-schema";

export const AdminActionColorMap = {
  [AdminActionType.CreateBan]: "error",
  [AdminActionType.ForceMute]: "warning",
  [AdminActionType.ForceUnmute]: "success",
  [AdminActionType.KickFromRoom]: "error",
  [AdminActionType.KickFromVoice]: "warning",
  [AdminActionType.TimeoutUser]: "warning",
} as const satisfies Record<AdminActionType, string>;
