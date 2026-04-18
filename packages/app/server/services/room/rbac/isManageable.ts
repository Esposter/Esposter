import type { Context } from "@@/server/trpc/context";

import { isManageable as isManageablePure } from "#shared/services/room/rbac/isManageable";
import { getActorContext } from "@@/server/services/room/rbac/getActorContext";

export const isManageable = async (
  db: Context["db"],
  actorId: string,
  roomId: string,
  targetPosition: number,
): Promise<boolean> => {
  const { actorTopPosition, isOwner } = await getActorContext(db, actorId, roomId);
  return isManageablePure(actorTopPosition, targetPosition, isOwner);
};
