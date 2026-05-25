import type { Promisable } from "type-fest";

import { AdminActionType } from "@esposter/db-schema";

type AdminActionHook = (roomId: string) => Promisable<void>;

interface AdminActionHookMap {
  [AdminActionType.CreateBan]: AdminActionHook[];
  [AdminActionType.ForceMute]: AdminActionHook[];
  [AdminActionType.ForceUnmute]: AdminActionHook[];
  [AdminActionType.KickFromCall]: AdminActionHook[];
  [AdminActionType.KickFromRoom]: AdminActionHook[];
  [AdminActionType.SoftBan]: AdminActionHook[];
  [AdminActionType.StopScreenShare]: AdminActionHook[];
  [AdminActionType.TimeoutUser]: AdminActionHook[];
  [AdminActionType.Warn]: AdminActionHook[];
}

export const AdminActionHookMap: AdminActionHookMap = {
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
