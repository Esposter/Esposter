import { SettingsType } from "@/models/message/room/SettingsType";
import { RoomPermission } from "@esposter/db-schema";

// A panel is listed only where its own actions can succeed: every write behind these reads and forms is guarded by
// The same permission server-side, so an ungated row is a rail entry whose every control rejects. Profile is the
// One panel with no entry — it edits the reader's own membership, which every member may do
export const SettingsPermissionMap: Partial<Record<SettingsType, RoomPermission>> = {
  [SettingsType.Attachments]: RoomPermission.ManageRoom,
  [SettingsType.AuditLog]: RoomPermission.ManageRoom,
  [SettingsType.Bans]: RoomPermission.BanMembers,
  [SettingsType.Emojis]: RoomPermission.ManageEmojis,
  [SettingsType.Invites]: RoomPermission.ManageRoom,
  [SettingsType.Members]: RoomPermission.ManageRoles,
  [SettingsType.Overview]: RoomPermission.ManageRoom,
  [SettingsType.Roles]: RoomPermission.ManageRoles,
  [SettingsType.Webhooks]: RoomPermission.ManageWebhooks,
  [SettingsType.WordFilter]: RoomPermission.ManageRoom,
};
