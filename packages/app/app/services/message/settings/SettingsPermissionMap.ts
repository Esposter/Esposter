import { SettingsType } from "@/models/message/room/SettingsType";
import { RoomPermission } from "@esposter/db-schema";

export const SettingsPermissionMap: Partial<Record<SettingsType, RoomPermission>> = {
  [SettingsType.AuditLog]: RoomPermission.ManageRoom,
  [SettingsType.Bans]: RoomPermission.BanMembers,
};
