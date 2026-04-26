import type { ActorContext } from "@@/server/models/room/ActorContext";
import type { Context } from "@@/server/trpc/context";

import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";

export const getActorContext = async (
  db: Context["db"],
  actorUserId: string,
  roomId: string,
): Promise<ActorContext> => {
  const [room, actorTopPosition] = await Promise.all([
    db.query.roomsInMessage.findFirst({ columns: { userId: true }, where: { id: { eq: roomId } } }),
    getTopRolePosition(db, actorUserId, roomId),
  ]);
  return { actorTopPosition, isOwner: room?.userId === actorUserId };
};
