import type { FriendRequestInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { useEventGridPublisherClient } from "#server/composables/azure/eventGrid/useEventGridPublisherClient";
import { on } from "#server/services/events/on";
import { friendEventEmitter } from "#server/services/friend/events/friendEventEmitter";
import { getFriendshipId } from "#server/services/friend/getFriendshipId";
import { readUserPair } from "#server/services/friend/readUserPair";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import {
  AppNotificationType,
  DatabaseEntityType,
  FriendRequestInSocialRelations,
  friendRequestsInSocial,
  friendsInSocial,
  publishNotification,
} from "@esposter/db-schema";
import { getResultAsync, noop, Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

export const friendRequestRouter = router({
  acceptFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<PublicUser>(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const friendshipId = getFriendshipId(senderId, userId);
      // The sender is both the emit payload and the return value, so nothing fallible sits between the write and
      // The emit
      const [senderUser, receiverUser] = await readUserPair(ctx.db, senderId, userId);
      requireMutation(
        (
          await ctx.db.transaction(async (tx) => {
            const [deletedFriendRequest] = await tx
              .delete(friendRequestsInSocial)
              .where(and(eq(friendRequestsInSocial.id, friendshipId), eq(friendRequestsInSocial.receiverId, userId)))
              .returning();
            if (deletedFriendRequest)
              return tx.insert(friendsInSocial).values({ id: friendshipId, receiverId: userId, senderId }).returning();
            else return [];
          })
        )[0],
        Operation.Update,
        DatabaseEntityType.Friend,
        friendshipId,
        "NOT_FOUND",
      );
      friendEventEmitter.emit("acceptFriendRequest", { receiverUser, senderUser });
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
            .delete(friendRequestsInSocial)
            .where(and(eq(friendRequestsInSocial.id, friendshipId), eq(friendRequestsInSocial.receiverId, userId)))
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
    for await (const [{ receiverUser, senderUser }] of on(friendEventEmitter, "acceptFriendRequest", { signal }))
      if (senderUser.id === userId) yield receiverUser;
      else if (receiverUser.id === userId) yield senderUser;
  }),
  onDeclineFriendRequest: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [{ receiverId, senderId }] of on(friendEventEmitter, "declineFriendRequest", { signal }))
      if (senderId === userId) yield receiverId;
      else if (receiverId === userId) yield senderId;
  }),
  onSendFriendRequest: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    for await (const [friendRequest] of on(friendEventEmitter, "sendFriendRequest", { signal })) {
      if (![friendRequest.receiverId, friendRequest.senderId].includes(userId)) continue;
      yield friendRequest;
    }
  }),
  readFriendRequests: standardAuthedProcedure.query<FriendRequestInSocialWithRelations[]>(({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db.query.friendRequestsInSocial.findMany({
      where: { OR: [{ receiverId: { eq: userId } }, { senderId: { eq: userId } }] },
      with: FriendRequestInSocialRelations,
    });
  }),
  sendFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<FriendRequestInSocialWithRelations>(async ({ ctx, input: receiverId }) => {
      const userId = ctx.getSessionPayload.user.id;
      if (userId === receiverId) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Friend, userId);
      const [receiverUser, senderUser] = await readUserPair(ctx.db, receiverId, userId);
      const friendshipId = getFriendshipId(userId, receiverId);
      const [newFriendRequest] = await ctx.db.transaction(async (tx) => {
        const existingBlock = await tx.query.blocksInSocial.findFirst({
          where: {
            OR: [
              { blockedId: { eq: receiverId }, blockerId: { eq: userId } },
              { blockedId: { eq: userId }, blockerId: { eq: receiverId } },
            ],
          },
        });
        if (existingBlock) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Friend, receiverId);
        const existingFriend = await tx.query.friendsInSocial.findFirst({ where: { id: { eq: friendshipId } } });
        if (existingFriend)
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId);
        return tx
          .insert(friendRequestsInSocial)
          .values({ id: friendshipId, receiverId, senderId: userId })
          .onConflictDoNothing({ target: friendRequestsInSocial.id })
          .returning();
      });
      if (!newFriendRequest) {
        const existingFriendRequest = await ctx.db.query.friendRequestsInSocial.findFirst({
          where: { id: { eq: friendshipId } },
          with: FriendRequestInSocialRelations,
        });
        if (existingFriendRequest?.senderId !== userId)
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId);
        return existingFriendRequest;
      }
      const friendRequest: FriendRequestInSocialWithRelations = {
        ...newFriendRequest,
        receiver: receiverUser,
        sender: senderUser,
      };
      friendEventEmitter.emit("sendFriendRequest", friendRequest);
      // Best-effort after the insert — a failed publish loses one notification, never the friend request that
      // Already landed.
      await getResultAsync(() =>
        publishNotification(useEventGridPublisherClient(), {
          receiverId,
          senderId: userId,
          type: AppNotificationType.FriendRequest,
        }),
      ).match(noop, console.error);
      return friendRequest;
    }),
});
