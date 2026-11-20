import type { BlockInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { assertIsNotSelf } from "#server/services/friend/assertIsNotSelf";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import {
  BlockInSocialRelations,
  blocksInSocial,
  DatabaseEntityType,
  friendRequestsInSocial,
  friendsInSocial,
  PublicUserColumns,
} from "@esposter/db-schema";
import { getFriendshipId, Operation } from "@esposter/shared";
import { and, eq, isNotNull, isNull } from "drizzle-orm";

export const blockRouter = router({
  // The pair's friendship and request go with the block, and the blocked user's posts leave the blocker's feed
  createBlock: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<PublicUser>(async ({ ctx, input: targetUserId }) => {
      const userId = ctx.user.id;
      assertIsNotSelf(Operation.Create, DatabaseEntityType.Block, userId, targetUserId);

      const blockedUser = await requireEntity(
        ctx.db.query.usersInAuth.findFirst({ columns: PublicUserColumns, where: { id: { eq: targetUserId } } }),
        DatabaseEntityType.User,
        targetUserId,
      );
      const friendshipId = getFriendshipId(userId, targetUserId);
      const deletedAt = new Date();
      // The block revives its own tombstone by the conflict branch, which clears the deletion and raises the version. A live
      // Block is left as it is, since the set-where names only a tombstone
      await ctx.db.batch([
        ctx.db
          .update(friendRequestsInSocial)
          .set({ deletedAt })
          .where(and(eq(friendRequestsInSocial.id, friendshipId), isNull(friendRequestsInSocial.deletedAt))),
        ctx.db
          .update(friendsInSocial)
          .set({ deletedAt })
          .where(and(eq(friendsInSocial.id, friendshipId), isNull(friendsInSocial.deletedAt))),
        ctx.db
          .insert(blocksInSocial)
          .values({ blockedId: targetUserId, blockerId: userId })
          .onConflictDoUpdate({
            set: { deletedAt: null },
            setWhere: isNotNull(blocksInSocial.deletedAt),
            target: [blocksInSocial.blockerId, blocksInSocial.blockedId],
          }),
      ]);
      return blockedUser;
    }),
  deleteBlock: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<PublicUser["id"]>(async ({ ctx, input: blockedUserId }) => {
      const userId = ctx.user.id;
      assertIsNotSelf(Operation.Delete, DatabaseEntityType.Block, userId, blockedUserId);

      requireMutation(
        (
          await ctx.db
            .update(blocksInSocial)
            .set({ deletedAt: new Date() })
            .where(
              and(
                eq(blocksInSocial.blockerId, userId),
                eq(blocksInSocial.blockedId, blockedUserId),
                isNull(blocksInSocial.deletedAt),
              ),
            )
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.Block,
        blockedUserId,
        "NOT_FOUND",
      );
      return blockedUserId;
    }),
  // Unblocked users stay in this read as tombstones, so the client applies their removal
  readBlockedUsers: standardAuthedProcedure.query<BlockInSocialWithRelations[]>(({ ctx }) => {
    const userId = ctx.user.id;
    return ctx.db.query.blocksInSocial.findMany({ where: { blockerId: { eq: userId } }, with: BlockInSocialRelations });
  }),
});
