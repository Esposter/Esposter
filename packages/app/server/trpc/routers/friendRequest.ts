import type { FriendRequestNotificationEventGridData, FriendRequestWithRelations } from "@esposter/db-schema";

import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { on } from "@@/server/services/events/on";
import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { friendEventEmitter } from "@@/server/services/message/events/friendEventEmitter";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { getPushSubscriptionsForUser } from "@esposter/db";
import {
  AzureFunction,
  createEventGridEvent,
  DatabaseEntityType,
  FriendRequestRelations,
  friendRequests,
  friends,
} from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const friendRequestRouter = router({
  acceptFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const friendshipId = getFriendshipId(senderId, userId);
      // The sender is both the emit payload and the return value, so it is resolved as a guard — a sender that
      // Does not exist fails before anything is written, and nothing fallible sits between the write and the
      // Emit. Both users are read rather than rebuilt from the session: the session carries better-auth's own
      // View of the user, which is a subset of the row — a payload assembled from it can only be completed by
      // Inventing values for the columns it does not carry. Neither read depends on the other, so they go out
      // Together
      const [senderUser, receiverUser] = await Promise.all([
        requireEntity(
          ctx.db.query.users.findFirst({ where: { id: { eq: senderId } } }),
          DatabaseEntityType.User,
          senderId,
        ),
        requireEntity(ctx.db.query.users.findFirst({ where: { id: { eq: userId } } }), DatabaseEntityType.User, userId),
      ]);
      requireMutation(
        (
          await ctx.db.transaction(async (tx) => {
            const [deletedRequest] = await tx
              .delete(friendRequests)
              .where(and(eq(friendRequests.id, friendshipId), eq(friendRequests.receiverId, userId)))
              .returning();
            if (!deletedRequest) return [];
            return tx.insert(friends).values({ id: friendshipId, receiverId: userId, senderId }).returning();
          })
        )[0],
        Operation.Update,
        DatabaseEntityType.Friend,
        friendshipId,
        "NOT_FOUND",
      );
      friendEventEmitter.emit("acceptFriendRequest", {
        receiverId: userId,
        receiverUser,
        senderId,
        senderUser,
      });
      return senderUser;
    }),
  declineFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === senderId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.FriendRequest, userId).message,
        });

      const friendshipId = getFriendshipId(senderId, userId);
      requireMutation(
        (
          await ctx.db
            .delete(friendRequests)
            .where(and(eq(friendRequests.id, friendshipId), eq(friendRequests.receiverId, userId)))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.FriendRequest,
        friendshipId,
        "NOT_FOUND",
      );
      friendEventEmitter.emit("declineFriendRequest", { receiverId: userId, senderId });
    }),
  onAcceptFriendRequest: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ receiverId, receiverUser, senderId, senderUser }] of on(
      friendEventEmitter,
      "acceptFriendRequest",
      { signal },
    ))
      if (senderId === userId) yield receiverUser;
      else if (receiverId === userId) yield senderUser;
  }),
  onDeclineFriendRequest: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ receiverId, senderId }] of on(friendEventEmitter, "declineFriendRequest", { signal }))
      if (senderId === userId) yield receiverId;
      else if (receiverId === userId) yield senderId;
  }),
  onSendFriendRequest: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ friendRequest, receiverId, senderId }] of on(friendEventEmitter, "sendFriendRequest", {
      signal,
    })) {
      if (![receiverId, senderId].includes(userId)) continue;
      yield friendRequest;
    }
  }),
  readFriendRequests: standardAuthedProcedure.query<FriendRequestWithRelations[]>(({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db.query.friendRequests.findMany({
      where: { OR: [{ receiverId: { eq: userId } }, { senderId: { eq: userId } }] },
      with: FriendRequestRelations,
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
      // Read rather than rebuilt from the session: the session carries better-auth's own view of the user,
      // Which is a subset of the row — a payload assembled from it can only be completed by inventing values
      // For the columns it does not carry. Neither read depends on the other, so they go out together
      const [receiverUser, senderUser] = await Promise.all([
        requireEntity(
          ctx.db.query.users.findFirst({ where: { id: { eq: receiverId } } }),
          DatabaseEntityType.User,
          receiverId,
        ),
        requireEntity(ctx.db.query.users.findFirst({ where: { id: { eq: userId } } }), DatabaseEntityType.User, userId),
      ]);
      const friendshipId = getFriendshipId(userId, receiverId);
      const [newRequest] = await ctx.db.transaction(async (tx) => {
        const existingBlock = await tx.query.blocks.findFirst({
          where: {
            OR: [
              { blockedId: { eq: receiverId }, blockerId: { eq: userId } },
              { blockedId: { eq: userId }, blockerId: { eq: receiverId } },
            ],
          },
        });
        if (existingBlock)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, receiverId).message,
          });
        const existingFriend = await tx.query.friends.findFirst({
          where: { id: { eq: friendshipId } },
        });
        if (existingFriend)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId)
              .message,
          });
        return tx
          .insert(friendRequests)
          .values({ id: friendshipId, receiverId, senderId: userId })
          .onConflictDoNothing({ target: friendRequests.id })
          .returning();
      });
      if (!newRequest) {
        const existingRequest = await ctx.db.query.friendRequests.findFirst({
          where: { id: { eq: friendshipId } },
          with: FriendRequestRelations,
        });
        if (existingRequest?.senderId !== userId)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId)
              .message,
          });
        return existingRequest;
      }
      const friendRequest: FriendRequestWithRelations = {
        ...newRequest,
        receiver: receiverUser,
        sender: senderUser,
      };
      friendEventEmitter.emit("sendFriendRequest", { friendRequest, receiverId, senderId: userId });

      // Best-effort after the insert — a failed read skips this request's pushes, never the friend request that
      // Already landed.
      const readPushSubscriptions = await getResultAsync(() => getPushSubscriptionsForUser(ctx.db, receiverId))
        .orTee(console.error)
        .unwrapOr([]);
      if (readPushSubscriptions.length > 0) {
        const eventGridPublisherClient = useEventGridPublisherClient();
        const data: FriendRequestNotificationEventGridData = {
          notificationOptions: { icon: senderUser.image, title: senderUser.name },
          receiverId,
        };
        // Best-effort after the insert — a failed publish loses one push, never the friend request that already landed.
        await getResultAsync(() =>
          eventGridPublisherClient.send([
            createEventGridEvent(AzureFunction.ProcessFriendRequestNotification, `${userId}/${receiverId}`, data),
          ]),
        ).match(noop, console.error);
      }
      return friendRequest;
    }),
});
