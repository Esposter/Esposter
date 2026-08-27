import type { Context } from "@@/server/trpc/context";

import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { blocks, DatabaseEntityType, DerivedDatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq, inArray, or } from "drizzle-orm";

export const assertCanCreateDirectMessageParticipant = async (
  db: Context["db"] | Parameters<Parameters<Context["db"]["transaction"]>[0]>[0],
  actorUserId: string,
  participantIds: string[],
  targetUserId: string,
) => {
  const friendshipId = getFriendshipId(actorUserId, targetUserId);
  const friendship = await db.query.friends.findFirst({ where: { id: { eq: friendshipId } } });
  if (!friendship)
    throw getInvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, targetUserId);

  const existingBlock = await db
    .select()
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blockedId, targetUserId), inArray(blocks.blockerId, participantIds)),
        and(eq(blocks.blockerId, targetUserId), inArray(blocks.blockedId, participantIds)),
      ),
    )
    .limit(1);
  if (existingBlock.length > 0)
    throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, targetUserId);
};
