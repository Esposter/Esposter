import type { FriendRequestNotificationEventGridData, FriendRequestWithRelations, User } from "@esposter/db-schema";

import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { on } from "@@/server/services/events/on";
import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { readUserPair } from "@@/server/services/friend/readUserPair";
import { friendEventEmitter } from "@@/server/services/message/events/friendEventEmitter";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
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
import { getResultAsync, noop, Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

export const friendRequestRouter = router({
  acceptFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<User>(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const friendshipId = getFriendshipId(senderId, userId);
      // The sender is both the emit payload and the return value, so nothing fallible sits between the write and
      // The emit
      const [senderUser, receiverUser] = await readUserPair(ctx.db, senderId, userId);
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
    .mutation<void>(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === senderId)
        throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.FriendRequest, userId);

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
    .mutation<FriendRequestWithRelations>(async ({ ctx, input: receiverId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === receiverId) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Friend, userId);
      const [receiverUser, senderUser] = await readUserPair(ctx.db, receiverId, userId);
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
        if (existingBlock) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Friend, receiverId);
        const existingFriend = await tx.query.friends.findFirst({
          where: { id: { eq: friendshipId } },
        });
        if (existingFriend)
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId);
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
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId);
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
