import { AdminActionType } from "@esposter/db-schema";

// The actions that take nothing past their target. The input's type and its schema both read this one list, so a
// member cannot sit in one of them and be missing from the other
export const UnparameterizedAdminActionTypes = [
  AdminActionType.CreateBan,
  AdminActionType.ForceMute,
  AdminActionType.ForceUnmute,
  AdminActionType.KickFromCall,
  AdminActionType.KickFromRoom,
  AdminActionType.SoftBan,
  AdminActionType.StopScreenShare,
  AdminActionType.Warn,
] as const;

export type UnparameterizedAdminActionType = (typeof UnparameterizedAdminActionTypes)[number];
