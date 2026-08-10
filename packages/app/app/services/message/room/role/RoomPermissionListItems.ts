import { RoomPermission } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";

// The enum key is the label, split on its word boundaries — a separate title per permission would be a second
// List to keep in step with the enum
export const RoomPermissionListItems = Object.entries(RoomPermission).map(([key, permission]) => ({
  permission,
  title: normalizeString(key.replaceAll(/(?<upper>[A-Z])/gu, " $1")),
}));
