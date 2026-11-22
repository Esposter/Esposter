import type { Database } from "@esposter/db-schema";

import { getPermissionsByRoomId } from "#src/services/room/rbac/getPermissionsByRoomId";

export const getPermissions = async (db: Database, userId: string, roomId: string) =>
  (await getPermissionsByRoomId(db, userId, [roomId])).get(roomId) ?? 0n;
