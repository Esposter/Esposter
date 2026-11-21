import { SettingsType } from "#src/models/message/room/SettingsType";
import { RoomPermission } from "@esposter/db-schema";

// A panel is listed only where its own actions can succeed: every read and every write behind these panels is
// Guarded by the same permission server-side, so an ungated row is a rail entry whose every control rejects. A panel
// With no entry holds no permission: Profile edits the reader's own membership, which every member may do, and Delete
// Is guarded by ownership rather than by a permission
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
