import type { AdminActionHookMap as AdminActionHookMapType } from "@/models/message/moderation/AdminActionHookMap";

import { AdminActionType } from "@esposter/db-schema";

export const AdminActionHookMap: AdminActionHookMapType = {
  [AdminActionType.CreateBan]: [],
  [AdminActionType.ForceMute]: [],
  [AdminActionType.ForceUnmute]: [],
  [AdminActionType.KickFromCall]: [],
  [AdminActionType.KickFromRoom]: [],
  [AdminActionType.SoftBan]: [],
  [AdminActionType.StopScreenShare]: [],
  [AdminActionType.TimeoutUser]: [],
  [AdminActionType.Warn]: [],
};
