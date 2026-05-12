import { AdminActionType, RoomPermission } from "@esposter/db-schema";

export const AdminActionPermissionMap = {
  [AdminActionType.CreateBan]: RoomPermission.BanMembers,
  [AdminActionType.ForceMute]: RoomPermission.MuteMembers,
  [AdminActionType.ForceUnmute]: RoomPermission.MuteMembers,
  [AdminActionType.KickFromCall]: RoomPermission.MoveMembers,
  [AdminActionType.KickFromRoom]: RoomPermission.KickMembers,
  [AdminActionType.SoftBan]: RoomPermission.BanMembers,
  [AdminActionType.TimeoutUser]: RoomPermission.KickMembers,
  [AdminActionType.Warn]: RoomPermission.ManageMessages,
} as const satisfies Record<AdminActionType, RoomPermission>;
