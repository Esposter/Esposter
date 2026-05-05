import type { User } from "@esposter/db-schema";

import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { BlockRelations, blocks, DatabaseEntityType, friendRequests, friends } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const blockRouter = router({
  blockUser: standardAuthedProcedure.input(friendUserIdInputSchema).mutation(async ({ ctx, input: targetUserId }) => {
    const userId = ctx.getSessionPayload.user.id;
    if (userId === targetUserId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Block, userId).message,
      });
    const blockedUser = await requireEntity(
      ctx.db.query.users.findFirst({ where: { id: { eq: targetUserId } } }),
      DatabaseEntityType.Block,
      targetUserId,
    );
    const friendshipId = getFriendshipId(userId, targetUserId);
    await ctx.db.transaction(async (tx) => {
      await tx.delete(friendRequests).where(eq(friendRequests.id, friendshipId));
      await tx.delete(friends).where(eq(friends.id, friendshipId));
      await tx.insert(blocks).values({ blockedId: targetUserId, blockerId: userId }).onConflictDoNothing();
    });
    return blockedUser;
  }),
  readBlockedUsers: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const blockedRows = await ctx.db.query.blocks.findMany({
      where: { blockerId: { eq: userId } },
      with: BlockRelations,
    });
    return blockedRows.map(({ blocked }) => blocked);
  }),
  unblockUser: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: blockedUserId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === blockedUserId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.Block, userId).message,
        });

      requireMutation(
        (
          await ctx.db
            .delete(blocks)
            .where(and(eq(blocks.blockerId, userId), eq(blocks.blockedId, blockedUserId)))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.Block,
        blockedUserId,
        "NOT_FOUND",
      );
      return blockedUserId;
    }),
});
