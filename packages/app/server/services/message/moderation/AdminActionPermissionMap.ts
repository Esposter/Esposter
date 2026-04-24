import { AdminActionType, RoomPermission } from "@esposter/db-schema";

export const AdminActionPermissionMap = {
  [AdminActionType.CreateBan]: RoomPermission.BanMembers,
  [AdminActionType.ForceMute]: RoomPermission.MuteMembers,
  [AdminActionType.ForceUnmute]: RoomPermission.MuteMembers,
  [AdminActionType.KickFromRoom]: RoomPermission.KickMembers,
  [AdminActionType.KickFromVoice]: RoomPermission.MoveMembers,
  [AdminActionType.TimeoutUser]: RoomPermission.KickMembers,
} as const satisfies Record<AdminActionType, RoomPermission>;
