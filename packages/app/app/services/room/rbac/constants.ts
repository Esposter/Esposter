import { SettingsPermissionMap } from "@/services/message/settings/SettingsPermissionMap";
import { RoomPermission } from "@esposter/db-schema";

// Opening room settings means being able to act in at least one of its panels, so the gate is the union of what the
// Panels require rather than a second list beside it — a member who may only manage emoji or bans still reaches the
// Rail that manages them
export const MANAGEMENT_PERMISSIONS = Object.values(SettingsPermissionMap).reduce(
  (permissions, permission) => permissions | permission,
  RoomPermission.Administrator,
);
