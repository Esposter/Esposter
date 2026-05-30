import type { User } from "@esposter/db-schema";

import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { searchUsersInputSchema } from "#shared/models/db/friend/SearchUsersInput";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { on } from "@@/server/services/events/on";
import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { friendEventEmitter } from "@@/server/services/message/events/friendEventEmitter";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { blocks, DatabaseEntityType, friendRequests, friends, users } from "@esposter/db-schema";
import { InvalidOperationError, MAX_READ_LIMIT, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getColumns, ilike, isNull, ne, or } from "drizzle-orm";

export const friendRouter = router({
  deleteFriend: standardAuthedProcedure.input(friendUserIdInputSchema).mutation(async ({ ctx, input: friendId }) => {
    const userId = ctx.getSessionPayload.user.id;
    if (userId === friendId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.Friend, userId).message,
      });

    const friendshipId = getFriendshipId(userId, friendId);
    requireMutation(
      (await ctx.db.delete(friends).where(eq(friends.id, friendshipId)).returning())[0],
      Operation.Delete,
      DatabaseEntityType.Friend,
      friendshipId,
      "NOT_FOUND",
    );
    friendEventEmitter.emit("deleteFriend", { receiverId: friendId, senderId: userId });
  }),
  onDeleteFriend: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ receiverId, senderId }] of on(friendEventEmitter, "deleteFriend", { signal })) {
      if (receiverId !== userId) continue;
      yield senderId;
    }
  }),
  readFriends: standardAuthedProcedure.query<User[]>(({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db
      .select(getColumns(users))
      .from(friends)
      .innerJoin(
        users,
        or(
          and(eq(friends.senderId, userId), eq(users.id, friends.receiverId)),
          and(eq(friends.receiverId, userId), eq(users.id, friends.senderId)),
        ),
      );
  }),
  readPendingRequests: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const pendingFriendRequests = await ctx.db.query.friendRequests.findMany({
      where: { receiverId: { eq: userId } },
      with: { sender: true },
    });
    return pendingFriendRequests.map(({ sender }) => sender);
  }),
  readSentRequests: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const sentFriendRequests = await ctx.db.query.friendRequests.findMany({
      where: { senderId: { eq: userId } },
      with: { receiver: true },
    });
    return sentFriendRequests.map(({ receiver }) => receiver);
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
      .select(getColumns(users))
      .from(users)
      .leftJoin(blockedSubquery, eq(blockedSubquery.id, users.id))
      .where(and(ilike(users.name, `%${escapeLike(name)}%`), ne(users.id, userId), isNull(blockedSubquery.id)))
      .limit(MAX_READ_LIMIT);
  }),
  sendFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: receiverId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === receiverId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, userId).message,
        });
      const id = getFriendshipId(userId, receiverId);
      const [newRequest] = await ctx.db
        .insert(friendRequests)
        .values({ id, receiverId, senderId: userId })
        .onConflictDoNothing({ target: friendRequests.id })
        .returning();
      if (newRequest) return newRequest;

      const existingRequest = await requireEntity(
        ctx.db.query.friendRequests.findFirst({ where: { id: { eq: id } } }),
        DatabaseEntityType.Friend,
        id,
      );
      return existingRequest;
    }),
});
