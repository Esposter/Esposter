import type { PublicUser } from "@esposter/db-schema";

import { getProcedureTopics } from "#server/services/realtime/getProcedureTopics";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { getTopic } from "#shared/services/realtime/getTopic";
import {
  BlockInSocialRelations,
  blocksInSocial,
  DatabaseEntityType,
  friendRequestsInSocial,
  friendsInSocial,
  PublicUserColumns,
  TopicKind,
} from "@esposter/db-schema";
import { getFriendshipId, Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

export const blockRouter = router({
  createBlock: standardAuthedProcedure
    .meta({
      // The pair's friendship and request go with the block, and the blocked user's posts leave the blocker's feed
      topics: getProcedureTopics(friendUserIdInputSchema, (targetUserId, { userId }) =>
        userId === undefined
          ? []
          : [
              getTopic(TopicKind.Block, userId),
              getTopic(TopicKind.Feed, "posts"),
              getTopic(TopicKind.Friend, userId),
              getTopic(TopicKind.Friend, targetUserId),
              getTopic(TopicKind.FriendRequest, userId),
              getTopic(TopicKind.FriendRequest, targetUserId),
            ],
      ),
    })
    .input(friendUserIdInputSchema)
    .mutation<PublicUser>(async ({ ctx, input: targetUserId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === targetUserId) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Block, userId);

      const blockedUser = await requireEntity(
        ctx.db.query.usersInAuth.findFirst({ columns: PublicUserColumns, where: { id: { eq: targetUserId } } }),
        DatabaseEntityType.User,
        targetUserId,
      );
      const friendshipId = getFriendshipId(userId, targetUserId);
      await ctx.db.batch([
        ctx.db.delete(friendRequestsInSocial).where(eq(friendRequestsInSocial.id, friendshipId)),
        ctx.db.delete(friendsInSocial).where(eq(friendsInSocial.id, friendshipId)),
        ctx.db.insert(blocksInSocial).values({ blockedId: targetUserId, blockerId: userId }).onConflictDoNothing(),
      ]);
      return blockedUser;
    }),
  deleteBlock: standardAuthedProcedure
    .meta({
      topics: ({ userId }) =>
        userId === undefined ? [] : [getTopic(TopicKind.Block, userId), getTopic(TopicKind.Feed, "posts")],
    })
    .input(friendUserIdInputSchema)
    .mutation<PublicUser["id"]>(async ({ ctx, input: blockedUserId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === blockedUserId) throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.Block, userId);

      requireMutation(
        (
          await ctx.db
            .delete(blocksInSocial)
            .where(and(eq(blocksInSocial.blockerId, userId), eq(blocksInSocial.blockedId, blockedUserId)))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.Block,
        blockedUserId,
        "NOT_FOUND",
      );
      return blockedUserId;
    }),
  readBlockedUsers: standardAuthedProcedure
    .meta({ topics: ({ userId }) => (userId === undefined ? [] : [getTopic(TopicKind.Block, userId)]) })
    .query<PublicUser[]>(async ({ ctx }) => {
      const userId = ctx.getSessionPayload.user.id;
      const blockedRows = await ctx.db.query.blocksInSocial.findMany({
        where: { blockerId: { eq: userId } },
        with: BlockInSocialRelations,
      });
      return blockedRows.map(({ blocked }) => blocked);
    }),
});
