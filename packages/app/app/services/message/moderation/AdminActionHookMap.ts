import type { Promisable } from "type-fest";

import { AdminActionType } from "@esposter/db-schema";

export interface AdminActionHookMap {
  [AdminActionType.CreateBan]: AdminActionHook[];
  [AdminActionType.ForceMute]: AdminActionHook[];
  [AdminActionType.ForceUnmute]: AdminActionHook[];
  [AdminActionType.KickFromRoom]: AdminActionHook[];
  [AdminActionType.KickFromVoice]: AdminActionHook[];
  [AdminActionType.TimeoutUser]: AdminActionHook[];
}

type AdminActionHook = (roomId: string) => Promisable<void>;

export const AdminActionHookMap: AdminActionHookMap = {
  [AdminActionType.CreateBan]: [],
  [AdminActionType.ForceMute]: [],
  [AdminActionType.ForceUnmute]: [],
  [AdminActionType.KickFromRoom]: [],
  [AdminActionType.KickFromVoice]: [],
  [AdminActionType.TimeoutUser]: [],
};
