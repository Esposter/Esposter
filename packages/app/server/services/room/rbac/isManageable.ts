import type { Context } from "@@/server/trpc/context";

import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";

export const isManageable = async (
  db: Context["db"],
  actorId: string,
  roomId: string,
  targetPosition: number,
): Promise<boolean> => {
  const room = await db.query.rooms.findFirst({
    columns: { userId: true },
    where: (rooms, { eq }) => eq(rooms.id, roomId),
  });
  if (!room) return false;
  else if (room.userId === actorId) return true;

  const actorTopRolePosition = await getTopRolePosition(db, actorId, roomId);
  return actorTopRolePosition > targetPosition;
};
