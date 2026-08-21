import { SettingsType } from "@/models/message/room/SettingsType";
import { RoomPermission } from "@esposter/db-schema";

export const SettingsPermissionMap: Partial<Record<SettingsType, RoomPermission>> = {
  [SettingsType.Attachments]: RoomPermission.ManageRoom,
  [SettingsType.AuditLog]: RoomPermission.ManageRoom,
  [SettingsType.Bans]: RoomPermission.BanMembers,
  [SettingsType.Emojis]: RoomPermission.ManageEmojis,
  [SettingsType.WordFilter]: RoomPermission.ManageRoom,
};
