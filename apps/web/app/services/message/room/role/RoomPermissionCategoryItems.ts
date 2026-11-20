import { RoomPermissionDefinitionMap } from "#src/services/message/room/role/RoomPermissionDefinitionMap";
import { RoomPermission } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";

// Object.keys types each key as a string, so the type guard narrows them back to the enum's own names
const checkIsRoomPermissionName = (key: string): key is keyof typeof RoomPermission => key in RoomPermission;
// The enum key is the title, split on its word boundaries — a separate title per permission would be a second
// List to keep in step with the enum, where the description below is one the type already keeps in step
const permissionItems = Object.keys(RoomPermission)
  .filter((key) => checkIsRoomPermissionName(key))
  .map((key) => {
    const { category, description } = RoomPermissionDefinitionMap[key];
    return {
      category,
      description,
      permission: RoomPermission[key],
      title: normalizeString(key.replaceAll(/(?<upper>[A-Z])/gu, " $1")),
    };
  });
// Grouped in the order the bits already run, which is category by category from what every member has to what
// Only an owner should — so the headings are read off that order rather than being a third list to maintain
export const RoomPermissionCategoryItems = Array.from(
  new Set(permissionItems.map(({ category }) => category)),
  (category) => ({ category, permissions: permissionItems.filter((item) => item.category === category) }),
);
