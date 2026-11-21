import { SettingsType } from "#src/models/message/room/SettingsType";
import { RoomPermission } from "@esposter/db-schema";

// A panel is listed only where its own actions can succeed: every read and every write behind these panels is
// Guarded by the same permission server-side, so an ungated row is a rail entry whose every control rejects.
// A null is a panel with no permission to hold, written out rather than left out: Profile edits the reader's own
// Membership, which every member may do, and Delete is guarded by ownership rather than by a permission
export const SettingsPermissionMap: Record<SettingsType, null | RoomPermission> = {
  [SettingsType.Attachments]: RoomPermission.ManageRoom,
  [SettingsType.AuditLog]: RoomPermission.ManageRoom,
  [SettingsType.Bans]: RoomPermission.BanMembers,
  [SettingsType.Delete]: null,
  [SettingsType.Emojis]: RoomPermission.ManageEmojis,
  [SettingsType.Invites]: RoomPermission.ManageRoom,
  [SettingsType.Members]: RoomPermission.ManageRoles,
  [SettingsType.Overview]: RoomPermission.ManageRoom,
  [SettingsType.Profile]: null,
  [SettingsType.Roles]: RoomPermission.ManageRoles,
  [SettingsType.Webhooks]: RoomPermission.ManageWebhooks,
  [SettingsType.WordFilter]: RoomPermission.ManageRoom,
};
