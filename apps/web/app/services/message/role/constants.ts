import { createTable } from "#src/services/shared/overlay/createTable";
import { roomMemberPermissionsInMessage, roomRolesInMessage, usersToRoomRolesInMessage } from "@esposter/db-schema";

// The role rows the overlay holds, one slot each. A role is keyed by its id, an assignment by its member, room and
// Role, And an override by its member and room
export const roomRoleTable = createTable(roomRolesInMessage);
export const userToRoomRoleTable = createTable(usersToRoomRolesInMessage);
export const roomMemberPermissionTable = createTable(roomMemberPermissionsInMessage);
// The role tables a write's header can name a row of, in the order the role writes name them
export const roleTables: [typeof roomRoleTable, typeof userToRoomRoleTable, typeof roomMemberPermissionTable] = [
  roomRoleTable,
  userToRoomRoleTable,
  roomMemberPermissionTable,
];
