import { db } from "@/services/db";
import { roomRolesInMessage, usersToRoomRolesInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, inArray, or } from "drizzle-orm";

export const getPermissions = async (userId: string, roomId: string): Promise<bigint> => {
  const memberRoomIdsSubquery = db
    .select({ roomId: usersToRoomsInMessage.roomId })
    .from(usersToRoomsInMessage)
    .where(and(eq(usersToRoomsInMessage.userId, userId), eq(usersToRoomsInMessage.roomId, roomId)));
  const roleIdsSubquery = db
    .select({ id: usersToRoomRolesInMessage.roleId })
    .from(usersToRoomRolesInMessage)
    .where(and(eq(usersToRoomRolesInMessage.userId, userId), eq(usersToRoomRolesInMessage.roomId, roomId)));
  const rows = await db
    .select({ permissions: roomRolesInMessage.permissions })
    .from(roomRolesInMessage)
    .where(
      and(
        eq(roomRolesInMessage.roomId, roomId),
        or(
          and(eq(roomRolesInMessage.isEveryone, true), inArray(roomRolesInMessage.roomId, memberRoomIdsSubquery)),
          inArray(roomRolesInMessage.id, roleIdsSubquery),
        ),
      ),
    );
  return rows.reduce((permissions, row) => permissions | row.permissions, 0n);
};
