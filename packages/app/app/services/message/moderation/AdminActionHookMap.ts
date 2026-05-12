import type { Promisable } from "type-fest";

import { AdminActionType } from "@esposter/db-schema";

export interface AdminActionHookMap {
  [AdminActionType.CreateBan]: AdminActionHook[];
  [AdminActionType.ForceMute]: AdminActionHook[];
  [AdminActionType.ForceUnmute]: AdminActionHook[];
  [AdminActionType.KickFromCall]: AdminActionHook[];
  [AdminActionType.KickFromRoom]: AdminActionHook[];
  [AdminActionType.SoftBan]: AdminActionHook[];
  [AdminActionType.TimeoutUser]: AdminActionHook[];
  [AdminActionType.Warn]: AdminActionHook[];
}

type AdminActionHook = (roomId: string) => Promisable<void>;

export const AdminActionHookMap: AdminActionHookMap = {
  [AdminActionType.CreateBan]: [],
  [AdminActionType.ForceMute]: [],
  [AdminActionType.ForceUnmute]: [],
  [AdminActionType.KickFromCall]: [],
  [AdminActionType.KickFromRoom]: [],
  [AdminActionType.SoftBan]: [],
  [AdminActionType.TimeoutUser]: [],
  [AdminActionType.Warn]: [],
};
