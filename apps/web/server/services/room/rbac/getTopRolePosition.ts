import type { Context } from "#server/trpc/context";

import { getTopRolePositionByRoomId } from "#server/services/room/rbac/getTopRolePositionByRoomId";

export const getTopRolePosition = async (db: Context["db"], userId: string, roomId: string) =>
  (await getTopRolePositionByRoomId(db, userId, [roomId])).get(roomId) ?? -1;
