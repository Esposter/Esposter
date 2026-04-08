import type { User } from "@esposter/db-schema";
import type { z } from "zod";

import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { on } from "@@/server/services/events/on";
import { friendEventEmitter } from "@@/server/services/message/events/friendEventEmitter";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, friends, FriendshipStatus, selectUserSchema, users } from "@esposter/db-schema";
import { ID_SEPARATOR, InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, or } from "drizzle-orm";

const friendUserIdInputSchema = selectUserSchema.shape.id;
export type FriendUserIdInput = z.infer<typeof friendUserIdInputSchema>;

const searchUsersInputSchema = selectUserSchema.shape.name;
export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;

const getFriendshipId = (userIdA: string, userIdB: string) => [userIdA, userIdB].toSorted().join(ID_SEPARATOR);

export const friendRouter = router({
  acceptFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const id = getFriendshipId(senderId, userId);
      const [updatedFriend] = await ctx.db
        .update(friends)
        .set({ status: FriendshipStatus.Accepted })
        .where(and(eq(friends.id, id), eq(friends.receiverId, userId), eq(friends.status, FriendshipStatus.Pending)))
        .returning();
      if (!updatedFriend)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, id).message,
        });
      friendEventEmitter.emit("acceptFriendRequest", {
        receiverUser: ctx.getSessionPayload.user as unknown as User,
        senderId,
      });
      return updatedFriend;
    }),
  declineFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const id = getFriendshipId(senderId, userId);
      await ctx.db
        .delete(friends)
        .where(and(eq(friends.id, id), eq(friends.receiverId, userId), eq(friends.status, FriendshipStatus.Pending)));
      friendEventEmitter.emit("declineFriendRequest", { receiverId: userId, senderId });
    }),
  deleteFriend: standardAuthedProcedure.input(friendUserIdInputSchema).mutation(async ({ ctx, input: friendId }) => {
    const userId = ctx.getSessionPayload.user.id;
    const id = getFriendshipId(userId, friendId);
    await ctx.db.delete(friends).where(and(eq(friends.id, id), eq(friends.status, FriendshipStatus.Accepted)));
    friendEventEmitter.emit("deleteFriend", { receiverId: friendId, senderId: userId });
  }),
  onAcceptFriendRequest: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ receiverUser, senderId }] of on(friendEventEmitter, "acceptFriendRequest", { signal })) {
      if (senderId !== userId) continue;
      yield receiverUser;
    }
  }),
  onDeclineFriendRequest: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ receiverId, senderId }] of on(friendEventEmitter, "declineFriendRequest", { signal })) {
      if (senderId !== userId) continue;
      yield receiverId;
    }
  }),
  onDeleteFriend: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ receiverId, senderId }] of on(friendEventEmitter, "deleteFriend", { signal })) {
      if (receiverId !== userId) continue;
      yield senderId;
    }
  }),
  onSendFriendRequest: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ receiverId, senderUser }] of on(friendEventEmitter, "sendFriendRequest", { signal })) {
      if (receiverId !== userId) continue;
      yield senderUser;
    }
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
      )
      .where(eq(friends.status, FriendshipStatus.Accepted));
  }),
  readPendingRequests: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const pendingFriendships = await ctx.db.query.friends.findMany({
      where: (friends, { and, eq }) =>
        and(eq(friends.receiverId, userId), eq(friends.status, FriendshipStatus.Pending)),
      with: { sender: true },
    });
    return pendingFriendships.map(({ sender }) => sender);
  }),
  readSentRequests: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const sentFriendships = await ctx.db.query.friends.findMany({
      where: (friends, { and, eq }) => and(eq(friends.senderId, userId), eq(friends.status, FriendshipStatus.Pending)),
      with: { receiver: true },
    });
    return sentFriendships.map(({ receiver }) => receiver);
  }),
  searchUsers: standardAuthedProcedure.input(searchUsersInputSchema).query(({ ctx, input: name }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db.query.users.findMany({
      limit: MAX_READ_LIMIT,
      where: (users, { and, ilike, ne }) => and(ilike(users.name, `%${escapeLike(name)}%`), ne(users.id, userId)),
    });
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
      const [newFriend] = await ctx.db
        .insert(friends)
        .values({ id, receiverId, senderId: userId })
        .onConflictDoNothing({ target: friends.id })
        .returning();
      const friendship = newFriend ?? (await ctx.db.query.friends.findFirst({ where: eq(friends.id, id) }));
      if (!friendship)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, id).message,
        });
      if (newFriend)
        friendEventEmitter.emit("sendFriendRequest", {
          receiverId,
          senderUser: ctx.getSessionPayload.user as unknown as User,
        });
      return friendship;
    }),
});
