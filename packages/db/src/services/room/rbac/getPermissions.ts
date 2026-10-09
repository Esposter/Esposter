import type { GetPermissions } from "#src/models/room/rbac/GetPermissions";
import type { Database } from "@esposter/db-schema";

import {
  roomMemberPermissionsInMessage,
  RoomPermission,
  roomRolesInMessage,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { and, eq, inArray, or } from "drizzle-orm";

// Administrator is answered from the roles alone, so an override can neither grant it nor strip it
const OVERRIDABLE_PERMISSIONS = ~RoomPermission.Administrator;

export const getPermissions: GetPermissions = (async (
  db: Database,
  userId: string,
  roomIds: string | string[],
): Promise<bigint | Map<string, bigint>> => {
  const roomIdArray = Array.isArray(roomIds) ? roomIds : [roomIds];
  const memberRoomIdsSubquery = db
    .select({ roomId: usersToRoomsInMessage.roomId })
    .from(usersToRoomsInMessage)
    .where(and(eq(usersToRoomsInMessage.userId, userId), inArray(usersToRoomsInMessage.roomId, roomIdArray)));
  const roleIdsSubquery = db
    .select({ id: usersToRoomRolesInMessage.roleId })
    .from(usersToRoomRolesInMessage)
    .where(and(eq(usersToRoomRolesInMessage.userId, userId), inArray(usersToRoomRolesInMessage.roomId, roomIdArray)));
  const [rows, overrideRows] = await Promise.all([
    db
      .select({ permissions: roomRolesInMessage.permissions, roomId: roomRolesInMessage.roomId })
      .from(roomRolesInMessage)
      .where(
        and(
          inArray(roomRolesInMessage.roomId, roomIdArray),
          or(
            and(eq(roomRolesInMessage.isEveryone, true), inArray(roomRolesInMessage.roomId, memberRoomIdsSubquery)),
            inArray(roomRolesInMessage.id, roleIdsSubquery),
          ),
        ),
      ),
    db
      .select({
        allow: roomMemberPermissionsInMessage.allow,
        deny: roomMemberPermissionsInMessage.deny,
        roomId: roomMemberPermissionsInMessage.roomId,
      })
      .from(roomMemberPermissionsInMessage)
      .where(
        and(
          eq(roomMemberPermissionsInMessage.userId, userId),
          inArray(roomMemberPermissionsInMessage.roomId, roomIdArray),
        ),
      ),
  ]);
  const roomIdPermissionsMap = new Map<string, bigint>();
  for (const { permissions, roomId } of rows)
    roomIdPermissionsMap.set(roomId, (roomIdPermissionsMap.get(roomId) ?? 0n) | permissions);
  // The member's own row is the last word over the roles' union, deny before allow, so the effective bitfield is
  // Already the answer and every consumer reads it as one. Administrator stays with the roles: it is never masked
  // Out of the union, so an Administrator keeps every bit whatever a row says
  for (const { allow, deny, roomId } of overrideRows)
    roomIdPermissionsMap.set(
      roomId,
      ((roomIdPermissionsMap.get(roomId) ?? 0n) | (allow & OVERRIDABLE_PERMISSIONS)) &
        ~(deny & OVERRIDABLE_PERMISSIONS),
    );
  return Array.isArray(roomIds) ? roomIdPermissionsMap : (roomIdPermissionsMap.get(roomIds) ?? 0n);
}) as GetPermissions;
