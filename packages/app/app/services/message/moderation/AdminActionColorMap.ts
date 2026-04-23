import { AdminActionType } from "@esposter/db-schema";

export const AdminActionColorMap: Record<AdminActionType, string> = {
  [AdminActionType.BanUser]: "error",
  [AdminActionType.ForceMute]: "warning",
  [AdminActionType.ForceUnmute]: "success",
  [AdminActionType.KickFromRoom]: "error",
  [AdminActionType.KickFromVoice]: "warning",
  [AdminActionType.TimeoutUser]: "warning",
};
