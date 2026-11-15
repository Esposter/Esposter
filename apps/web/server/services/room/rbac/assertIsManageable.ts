import type { Context } from "#server/trpc/context";

import { checkIsRoomOwner } from "#server/services/room/rbac/checkIsRoomOwner";
import { getTopRolePosition } from "#server/services/room/rbac/getTopRolePosition";
import { checkIsMemberManageable } from "#shared/services/room/rbac/checkIsMemberManageable";
import { TRPCError } from "@trpc/server";

// Both sides are resolved against one read of the room, because ownership is what decides the comparison for
// Either of them and re-reading it per side would be the same row twice
export const assertIsManageable = async (
  db: Context["db"],
  actorUserId: string,
  targetUserId: string,
  roomId: string,
): Promise<void> => {
  const [room, actorTopPosition, targetTopPosition] = await Promise.all([
    db.query.roomsInMessage.findFirst({ columns: { userId: true }, where: { id: { eq: roomId } } }),
    getTopRolePosition(db, actorUserId, roomId),
    getTopRolePosition(db, targetUserId, roomId),
  ]);
  const isManageable = checkIsMemberManageable(
    { isOwner: checkIsRoomOwner(room, actorUserId), topPosition: actorTopPosition },
    { isOwner: checkIsRoomOwner(room, targetUserId), topPosition: targetTopPosition },
  );
  if (!isManageable) throw new TRPCError({ code: "UNAUTHORIZED" });
};
