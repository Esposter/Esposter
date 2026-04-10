import type { FriendRequestNotificationEventGridData, User } from "@esposter/db-schema";

import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { searchUsersInputSchema } from "#shared/models/db/friend/SearchUsersInput";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { on } from "@@/server/services/events/on";
import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { friendEventEmitter } from "@@/server/services/message/events/friendEventEmitter";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { getPushSubscriptionsForUser } from "@esposter/db";
import { AzureFunction, blocks, DatabaseEntityType, friends, FriendshipStatus, users } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, isNull, ilike, ne, or } from "drizzle-orm";

export type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
export type { SearchUsersInput } from "#shared/models/db/friend/SearchUsersInput";

export const friendRouter = router({
  acceptFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const friendshipId = getFriendshipId(senderId, userId);
      const [updatedFriend] = await ctx.db
        .update(friends)
        .set({ status: FriendshipStatus.Accepted })
        .where(
          and(
            eq(friends.id, friendshipId),
            eq(friends.receiverId, userId),
            eq(friends.status, FriendshipStatus.Pending),
          ),
        )
        .returning();
      if (!updatedFriend)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, friendshipId).message,
        });
      const receiverUser: User = {
        ...ctx.getSessionPayload.user,
        deletedAt: null,
        image: ctx.getSessionPayload.user.image ?? null,
      };
      friendEventEmitter.emit("acceptFriendRequest", { receiverUser, senderId });
      return updatedFriend;
    }),
  blockUser: standardAuthedProcedure.input(friendUserIdInputSchema).mutation(async ({ ctx, input: targetUserId }) => {
    const userId = ctx.getSessionPayload.user.id;
    if (userId === targetUserId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Block, userId).message,
      });
    // Remove any existing friendship in either direction
    const friendshipId = getFriendshipId(userId, targetUserId);
    await ctx.db.delete(friends).where(eq(friends.id, friendshipId));
    await ctx.db.insert(blocks).values({ blockedId: targetUserId, blockerId: userId }).onConflictDoNothing();
    const blockedUser = await ctx.db.query.users.findFirst({ where: eq(users.id, targetUserId) });
    if (!blockedUser)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new InvalidOperationError(Operation.Read, DatabaseEntityType.Block, targetUserId).message,
      });
    return blockedUser;
  }),
  declineFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const friendshipId = getFriendshipId(senderId, userId);
      const [declinedFriend] = await ctx.db
        .delete(friends)
        .where(
          and(
            eq(friends.id, friendshipId),
            eq(friends.receiverId, userId),
            eq(friends.status, FriendshipStatus.Pending),
          ),
        )
        .returning();
      if (declinedFriend) friendEventEmitter.emit("declineFriendRequest", { receiverId: userId, senderId });
    }),
  deleteFriend: standardAuthedProcedure.input(friendUserIdInputSchema).mutation(async ({ ctx, input: friendId }) => {
    const userId = ctx.getSessionPayload.user.id;
    const friendshipId = getFriendshipId(userId, friendId);
    const [deletedFriend] = await ctx.db
      .delete(friends)
      .where(and(eq(friends.id, friendshipId), eq(friends.status, FriendshipStatus.Accepted)))
      .returning();
    if (deletedFriend) friendEventEmitter.emit("deleteFriend", { receiverId: friendId, senderId: userId });
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
  readBlockedUsers: standardAuthedProcedure.query<User[]>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const blockedRows = await ctx.db.query.blocks.findMany({
      where: (b, { eq }) => eq(b.blockerId, userId),
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
  sendFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: receiverId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === receiverId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, userId).message,
        });
      const existingBlock = await ctx.db.query.blocks.findFirst({
        where: (b, { and, or, eq }) =>
          or(
            and(eq(b.blockerId, userId), eq(b.blockedId, receiverId)),
            and(eq(b.blockerId, receiverId), eq(b.blockedId, userId)),
          ),
      });
      if (existingBlock)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, receiverId).message,
        });
      const friendshipId = getFriendshipId(userId, receiverId);
      const [newFriend] = await ctx.db
        .insert(friends)
        .values({ id: friendshipId, receiverId, senderId: userId })
        .onConflictDoNothing({ target: friends.id })
        .returning();
      const friendship = newFriend ?? (await ctx.db.query.friends.findFirst({ where: eq(friends.id, friendshipId) }));
      if (!friendship)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, friendshipId).message,
        });
      if (newFriend) {
        const senderUser: User = {
          ...ctx.getSessionPayload.user,
          deletedAt: null,
          image: ctx.getSessionPayload.user.image ?? null,
        };
        friendEventEmitter.emit("sendFriendRequest", { receiverId, senderUser });

        const readPushSubscriptions = await getPushSubscriptionsForUser(ctx.db, receiverId);
        if (readPushSubscriptions.length > 0) {
          const eventGridPublisherClient = useEventGridPublisherClient();
          const data: FriendRequestNotificationEventGridData = {
            notificationOptions: { icon: senderUser.image, title: senderUser.name },
            receiverId,
          };
          await eventGridPublisherClient.send([
            {
              data,
              dataVersion: "1.0",
              eventType: AzureFunction.ProcessFriendRequestNotification,
              subject: `${userId}/${receiverId}`,
            },
          ]);
        }
      }
      const receiverUser = await ctx.db.query.users.findFirst({ where: eq(users.id, receiverId) });
      if (!receiverUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new InvalidOperationError(Operation.Read, DatabaseEntityType.Friend, receiverId).message,
        });
      return receiverUser;
    }),
  unblockUser: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: blockedUserId }) => {
      const userId = ctx.getSessionPayload.user.id;
      await ctx.db.delete(blocks).where(and(eq(blocks.blockerId, userId), eq(blocks.blockedId, blockedUserId)));
      return blockedUserId;
    }),
});
