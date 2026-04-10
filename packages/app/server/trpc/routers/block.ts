import type { User } from "@esposter/db-schema";

import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { BlockRelations, blocks, DatabaseEntityType, friendRequests, friends, users } from "@esposter/db-schema";
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
    const blockedUser = await ctx.db.query.users.findFirst({ where: eq(users.id, targetUserId) });
    if (!blockedUser)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new InvalidOperationError(Operation.Read, DatabaseEntityType.Block, targetUserId).message,
      });
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
      where: (blocks, { eq }) => eq(blocks.blockerId, userId),
      with: BlockRelations,
    });
    return blockedRows.map(({ blocked }) => blocked);
  }),
  unblockUser: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: blockedUserId }) => {
      const userId = ctx.getSessionPayload.user.id;
      await ctx.db.delete(blocks).where(and(eq(blocks.blockerId, userId), eq(blocks.blockedId, blockedUserId)));
      return blockedUserId;
    }),
});
