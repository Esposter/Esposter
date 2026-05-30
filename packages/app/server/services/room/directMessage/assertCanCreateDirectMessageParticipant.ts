import type { Context } from "@@/server/trpc/context";

import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { blocks, DatabaseEntityType, DerivedDatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
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
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: new InvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, targetUserId)
        .message,
    });

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
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, targetUserId).message,
    });
};
