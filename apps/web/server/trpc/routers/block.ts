import type { PublicUser } from "@esposter/db-schema";

import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
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
import { and, eq } from "drizzle-orm";

export const blockRouter = router({
  // The pair's friendship and request go with the block, and the blocked user's posts leave the blocker's feed
  createBlock: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<PublicUser>(async ({ ctx, input: targetUserId }) => {
      const userId = ctx.user.id;
      if (userId === targetUserId) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Block, userId);

      const blockedUser = await requireEntity(
        ctx.db.query.usersInAuth.findFirst({ columns: PublicUserColumns, where: { id: { eq: targetUserId } } }),
        DatabaseEntityType.User,
        targetUserId,
      );
      const friendshipId = getFriendshipId(userId, targetUserId);
      await ctx.db.batch([
        ctx.db.delete(friendRequestsInSocial).where(eq(friendRequestsInSocial.id, friendshipId)).returning(),
        ctx.db.delete(friendsInSocial).where(eq(friendsInSocial.id, friendshipId)).returning(),
        ctx.db
          .insert(blocksInSocial)
          .values({ blockedId: targetUserId, blockerId: userId })
          .onConflictDoNothing()
          .returning(),
      ]);
      return blockedUser;
    }),
  deleteBlock: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<PublicUser["id"]>(async ({ ctx, input: blockedUserId }) => {
      const userId = ctx.user.id;
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
  readBlockedUsers: standardAuthedProcedure.query<PublicUser[]>(async ({ ctx }) => {
    const userId = ctx.user.id;
    const blockedRows = await ctx.db.query.blocksInSocial.findMany({
      where: { blockerId: { eq: userId } },
      with: BlockInSocialRelations,
    });
    return blockedRows.map(({ blocked }) => blocked);
  }),
});
