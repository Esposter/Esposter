import type { User } from "@esposter/db-schema";

import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { searchUsersInputSchema } from "#shared/models/db/friend/SearchUsersInput";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { on } from "@@/server/services/events/on";
import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { friendEventEmitter } from "@@/server/services/message/events/friendEventEmitter";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { blocks, DatabaseEntityType, friendRequests, friends, users } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, ilike, isNull, ne, or } from "drizzle-orm";

export type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
export type { SearchUsersInput } from "#shared/models/db/friend/SearchUsersInput";

export const friendRouter = router({
  blockUser: standardAuthedProcedure.input(friendUserIdInputSchema).mutation(async ({ ctx, input: targetUserId }) => {
    const userId = ctx.getSessionPayload.user.id;
    if (userId === targetUserId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Block, userId).message,
      });
    const friendshipId = getFriendshipId(userId, targetUserId);
    await ctx.db.delete(friends).where(eq(friends.id, friendshipId));
    await ctx.db.delete(friendRequests).where(eq(friendRequests.id, friendshipId));
    await ctx.db.insert(blocks).values({ blockedId: targetUserId, blockerId: userId }).onConflictDoNothing();
    const blockedUser = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, targetUserId),
    });
    if (!blockedUser)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new InvalidOperationError(Operation.Read, DatabaseEntityType.Block, targetUserId).message,
      });
    return blockedUser;
  }),
  deleteFriend: standardAuthedProcedure.input(friendUserIdInputSchema).mutation(async ({ ctx, input: friendId }) => {
    const userId = ctx.getSessionPayload.user.id;
    const friendshipId = getFriendshipId(userId, friendId);
    const [deletedFriend] = await ctx.db.delete(friends).where(eq(friends.id, friendshipId)).returning();
    if (deletedFriend) friendEventEmitter.emit("deleteFriend", { receiverId: friendId, senderId: userId });
  }),
  onDeleteFriend: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ receiverId, senderId }] of on(friendEventEmitter, "deleteFriend", { signal })) {
      if (receiverId !== userId) continue;
      yield senderId;
    }
  }),
  readBlockedUsers: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const blockedRows = await ctx.db.query.blocks.findMany({
      where: (blocks, { eq }) => eq(blocks.blockerId, userId),
      with: { blocked: true },
    });
    return blockedRows.map(({ blocked }) => blocked);
  }),
  readFriends: standardAuthedProcedure.query<User[]>(({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db
      .select(getTableColumns(users))
      .from(friends)
      .innerJoin(
        users,
        or(
          and(eq(friends.senderId, userId), eq(users.id, friends.receiverId)),
          and(eq(friends.receiverId, userId), eq(users.id, friends.senderId)),
        ),
      );
  }),
  searchUsers: standardAuthedProcedure.input(searchUsersInputSchema).query(({ ctx, input: name }) => {
    const userId = ctx.getSessionPayload.user.id;
    const blockedSubquery = ctx.db
      .select({ id: blocks.blockedId })
      .from(blocks)
      .where(eq(blocks.blockerId, userId))
      .union(ctx.db.select({ id: blocks.blockerId }).from(blocks).where(eq(blocks.blockedId, userId)))
      .as("blocked_users");
    return ctx.db
      .select(getTableColumns(users))
      .from(users)
      .leftJoin(blockedSubquery, eq(blockedSubquery.id, users.id))
      .where(and(ilike(users.name, `%${escapeLike(name)}%`), ne(users.id, userId), isNull(blockedSubquery.id)))
      .limit(MAX_READ_LIMIT);
  }),
  unblockUser: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: blockedUserId }) => {
      const userId = ctx.getSessionPayload.user.id;
      await ctx.db.delete(blocks).where(and(eq(blocks.blockerId, userId), eq(blocks.blockedId, blockedUserId)));
      return blockedUserId;
    }),
});
