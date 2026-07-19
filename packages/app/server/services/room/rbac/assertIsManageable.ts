import type { Context } from "@@/server/trpc/context";

import { checkIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { getActorContext } from "@@/server/services/room/rbac/getActorContext";
import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";
import { TRPCError } from "@trpc/server";

export const assertIsManageable = async (
  db: Context["db"],
  actorUserId: string,
  targetUserId: string,
  roomId: string,
): Promise<void> => {
  const [actorContext, targetTopPosition] = await Promise.all([
    getActorContext(db, actorUserId, roomId),
    getTopRolePosition(db, targetUserId, roomId),
  ]);
  if (!checkIsManageable(actorContext.actorTopPosition, targetTopPosition, actorContext.isOwner))
    throw new TRPCError({ code: "UNAUTHORIZED" });
};
