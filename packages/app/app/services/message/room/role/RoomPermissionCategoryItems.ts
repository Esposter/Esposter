import { RoomPermissionDefinitionMap } from "@/services/message/room/role/RoomPermissionDefinitionMap";
import { RoomPermission } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";
// The enum key is the title, split on its word boundaries — a separate title per permission would be a second
// List to keep in step with the enum, where the description below is one the type already keeps in step
const permissionItems = Object.entries(RoomPermission).map(([key, permission]) => {
  const { category, description } = RoomPermissionDefinitionMap[key];
  return { category, description, permission, title: normalizeString(key.replaceAll(/(?<upper>[A-Z])/gu, " $1")) };
});
// Grouped in the order the bits already run, which is category by category from what every member has to what
// Only an owner should — so the headings are read off that order rather than being a third list to maintain
export const RoomPermissionCategoryItems = [...new Set(permissionItems.map(({ category }) => category))].map(
  (category) => ({ category, permissions: permissionItems.filter((item) => item.category === category) }),
);
