import type { RoomRoleInMessage } from "@esposter/db-schema";

import { roomRolesInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";
// A role is addressed by both keys so the room the permission was checked against is the room the row must
// Belong to — an id alone would let a manager of one room edit or delete another's
export const getRoomRoleWhere = (id: RoomRoleInMessage["id"], roomId: RoomRoleInMessage["roomId"]) =>
  and(eq(roomRolesInMessage.id, id), eq(roomRolesInMessage.roomId, roomId));
