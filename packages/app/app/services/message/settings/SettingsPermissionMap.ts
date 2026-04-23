import { SettingsType } from "@/models/message/room/SettingsType";
import { RoomPermission } from "@esposter/db-schema";

export const SettingsPermissionMap: Partial<Record<SettingsType, RoomPermission>> = {
  [SettingsType.Bans]: RoomPermission.BanMembers,
  [SettingsType.AuditLog]: RoomPermission.ManageRoom,
};
