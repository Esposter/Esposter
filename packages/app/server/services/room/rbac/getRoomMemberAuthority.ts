import type { RoomMemberAuthority } from "#shared/models/room/RoomMemberAuthority";
import type { Context } from "@@/server/trpc/context";

import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";

export const getRoomMemberAuthority = async (
  db: Context["db"],
  userId: string,
  roomId: string,
): Promise<RoomMemberAuthority> => {
  const [room, topPosition] = await Promise.all([
    db.query.roomsInMessage.findFirst({ columns: { userId: true }, where: { id: { eq: roomId } } }),
    getTopRolePosition(db, userId, roomId),
  ]);
  return { isOwner: room?.userId === userId, topPosition };
};
