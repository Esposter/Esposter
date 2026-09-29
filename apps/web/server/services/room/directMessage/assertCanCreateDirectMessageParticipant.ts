import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";

import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { blocksInSocial, DatabaseEntityType, DerivedDatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq, inArray, or } from "drizzle-orm";

export const assertCanCreateDirectMessageParticipant = async (
  db: Context["db"] | Transaction,
  actorUserId: string,
  participantIds: string[],
  targetUserId: string,
) => {
  const friendshipId = getFriendshipId(actorUserId, targetUserId);
  const friendship = await db.query.friendsInSocial.findFirst({ where: { id: { eq: friendshipId } } });
  if (!friendship)
    throw getInvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, targetUserId);

  const existingBlock = await db
    .select()
    .from(blocksInSocial)
    .where(
      or(
        and(eq(blocksInSocial.blockedId, targetUserId), inArray(blocksInSocial.blockerId, participantIds)),
        and(eq(blocksInSocial.blockerId, targetUserId), inArray(blocksInSocial.blockedId, participantIds)),
      ),
    )
    .limit(1);
  if (existingBlock.length > 0)
    throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, targetUserId);
};
