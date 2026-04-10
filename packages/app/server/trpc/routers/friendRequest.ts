import type { FriendRequestNotificationEventGridData, FriendRequestWithRelations, User } from "@esposter/db-schema";

import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { on } from "@@/server/services/events/on";
import { getFriendshipId } from "@@/server/services/friend/getFriendshipId";
import { friendEventEmitter } from "@@/server/services/message/events/friendEventEmitter";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { getPushSubscriptionsForUser } from "@esposter/db";
import {
  AzureFunction,
  DatabaseEntityType,
  FriendRequestRelations,
  friendRequests,
  friends,
  users,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const friendRequestRouter = router({
  acceptFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const friendshipId = getFriendshipId(senderId, userId);
      const [acceptedFriend] = await ctx.db.transaction(async (tx) => {
        const [deletedRequest] = await tx
          .delete(friendRequests)
          .where(and(eq(friendRequests.id, friendshipId), eq(friendRequests.receiverId, userId)))
          .returning();
        if (!deletedRequest) return [];
        return tx.insert(friends).values({ id: friendshipId, receiverId: userId, senderId }).returning();
      });
      if (!acceptedFriend)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Friend, friendshipId).message,
        });
      const senderUser = await ctx.db.query.users.findFirst({ where: eq(users.id, senderId) });
      if (!senderUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new InvalidOperationError(Operation.Read, DatabaseEntityType.Friend, senderId).message,
        });
      const receiverUser: User = {
        ...ctx.getSessionPayload.user,
        deletedAt: null,
        image: ctx.getSessionPayload.user.image ?? null,
      };
      friendEventEmitter.emit("acceptFriendRequest", { receiverUser, senderId });
      return senderUser;
    }),
  declineFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const friendshipId = getFriendshipId(senderId, userId);
      const [declinedRequest] = await ctx.db
        .delete(friendRequests)
        .where(and(eq(friendRequests.id, friendshipId), eq(friendRequests.receiverId, userId)))
        .returning();
      if (declinedRequest) friendEventEmitter.emit("declineFriendRequest", { receiverId: userId, senderId });
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
  onSendFriendRequest: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ friendRequest, receiverId }] of on(friendEventEmitter, "sendFriendRequest", { signal })) {
      if (receiverId !== userId) continue;
      yield friendRequest;
    }
  }),
  readFriendRequests: standardAuthedProcedure.query<FriendRequestWithRelations[]>(({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db.query.friendRequests.findMany({
      where: (friendRequests, { eq, or }) =>
        or(eq(friendRequests.receiverId, userId), eq(friendRequests.senderId, userId)),
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
      const receiverUser = await ctx.db.query.users.findFirst({ where: eq(users.id, receiverId) });
      if (!receiverUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new InvalidOperationError(Operation.Read, DatabaseEntityType.Friend, receiverId).message,
        });
      const friendshipId = getFriendshipId(userId, receiverId);
      const senderUser: User = {
        ...ctx.getSessionPayload.user,
        deletedAt: null,
        image: ctx.getSessionPayload.user.image ?? null,
      };
      const [newRequest] = await ctx.db.transaction(async (tx) => {
        const existingBlock = await tx.query.blocks.findFirst({
          where: (blocks, { and, eq, or }) =>
            or(
              and(eq(blocks.blockerId, userId), eq(blocks.blockedId, receiverId)),
              and(eq(blocks.blockerId, receiverId), eq(blocks.blockedId, userId)),
            ),
        });
        if (existingBlock)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Friend, receiverId).message,
          });
        const existingFriend = await tx.query.friends.findFirst({
          where: (friends, { eq }) => eq(friends.id, friendshipId),
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
          where: (friendRequests, { eq }) => eq(friendRequests.id, friendshipId),
          with: FriendRequestRelations,
        });
        if (!existingRequest || existingRequest.senderId !== userId)
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
      friendEventEmitter.emit("sendFriendRequest", { friendRequest, receiverId });

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
      return friendRequest;
    }),
});
