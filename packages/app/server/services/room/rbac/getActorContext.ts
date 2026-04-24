import type { ActorContext } from "@@/server/models/room/ActorContext";
import type { Context } from "@@/server/trpc/context";

import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";

export const getActorContext = async (
  db: Context["db"],
  actorUserId: string,
  roomId: string,
): Promise<ActorContext> => {
  const [room, topRolePositionMap] = await Promise.all([
    db.query.rooms.findFirst({ columns: { userId: true }, where: (rooms, { eq }) => eq(rooms.id, roomId) }),
    getTopRolePosition(db, actorUserId, [roomId]),
  ]);
  return { actorTopPosition: topRolePositionMap.get(roomId) ?? -1, isOwner: room?.userId === actorUserId };
};
