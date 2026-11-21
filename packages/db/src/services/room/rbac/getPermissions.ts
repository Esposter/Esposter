import type { Database } from "@esposter/db-schema";

import { inJsonArray } from "#src/services/shared/inJsonArray";
import {
  getLiveRowWhere,
  roomMemberPermissionsInMessage,
  RoomPermission,
  roomRolesInMessage,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { and, eq, inArray, or } from "drizzle-orm";

// Administrator is answered from the roles alone, so an override can neither grant it nor strip it
const OVERRIDABLE_PERMISSIONS = ~RoomPermission.Administrator;

// A tombstoned role, assignment or override counts for nothing, so each read below takes live rows only
export function getPermissions(db: Database, userId: string, roomId: string): Promise<bigint>;
export function getPermissions(db: Database, userId: string, roomIds: string[]): Promise<Map<string, bigint>>;
export async function getPermissions(db: Database, userId: string, roomIds: string | string[]) {
  const roomIdArray = Array.isArray(roomIds) ? roomIds : [roomIds];
  const memberRoomIdsSubquery = db
    .select({ roomId: usersToRoomsInMessage.roomId })
    .from(usersToRoomsInMessage)
    .where(
      and(
        eq(usersToRoomsInMessage.userId, userId),
        inJsonArray(usersToRoomsInMessage.roomId, roomIdArray),
        getLiveRowWhere(usersToRoomsInMessage),
      ),
    );
  const roleIdsSubquery = db
    .select({ id: usersToRoomRolesInMessage.roleId })
    .from(usersToRoomRolesInMessage)
    .where(
      and(
        eq(usersToRoomRolesInMessage.userId, userId),
        inJsonArray(usersToRoomRolesInMessage.roomId, roomIdArray),
        getLiveRowWhere(usersToRoomRolesInMessage),
      ),
    );
  const [rows, overrideRows] = await Promise.all([
    db
      .select({ permissions: roomRolesInMessage.permissions, roomId: roomRolesInMessage.roomId })
      .from(roomRolesInMessage)
      .where(
        and(
          inJsonArray(roomRolesInMessage.roomId, roomIdArray),
          getLiveRowWhere(roomRolesInMessage),
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
          inJsonArray(roomMemberPermissionsInMessage.roomId, roomIdArray),
          getLiveRowWhere(roomMemberPermissionsInMessage),
        ),
      ),
  ]);
  const roomIdPermissionsMap = new Map<string, bigint>();
  for (const { permissions, roomId } of rows)
    roomIdPermissionsMap.set(roomId, (roomIdPermissionsMap.get(roomId) ?? 0n) | permissions);
  // The member's own row is the last word over the roles' union, deny before allow
  // So the effective bitfield is already the answer, and every consumer reads it as one
  // Administrator stays with the roles: never masked out of the union, it keeps every bit whatever a row says
  for (const { allow, deny, roomId } of overrideRows)
    roomIdPermissionsMap.set(
      roomId,
      ((roomIdPermissionsMap.get(roomId) ?? 0n) | (allow & OVERRIDABLE_PERMISSIONS)) &
        ~(deny & OVERRIDABLE_PERMISSIONS),
    );
  return Array.isArray(roomIds) ? roomIdPermissionsMap : (roomIdPermissionsMap.get(roomIds) ?? 0n);
}
