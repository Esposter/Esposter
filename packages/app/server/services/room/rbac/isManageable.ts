import type { Context } from "@@/server/trpc/context";

import { getActorContext } from "@@/server/services/room/rbac/getActorContext";
import { isManageable as isManageablePure } from "#shared/services/room/rbac/isManageable";

export const isManageable = async (
  db: Context["db"],
  actorId: string,
  roomId: string,
  targetPosition: number,
): Promise<boolean> => {
  const { isOwner, actorTopPosition } = await getActorContext(db, actorId, roomId);
  return isManageablePure(actorTopPosition, targetPosition, isOwner);
};
