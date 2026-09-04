import { RoomPermission } from "#src/schema/roomRolesInMessage";

// What a permission bitfield means, in one place. The check lives beside `RoomPermission` rather than in
// Either consumer because both need it and neither may depend on the other: the client evaluates it against
// Permissions it was handed, `@esposter/db` evaluates it against permissions it queries for
export const checkHasPermission = (permissions: bigint, permission: bigint, isRoomOwner: boolean): boolean =>
  isRoomOwner || Boolean(permissions & RoomPermission.Administrator) || (permissions & permission) === permission;
