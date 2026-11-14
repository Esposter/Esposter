import type { FriendRequestInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { getJobQueue } from "#server/services/queue/getJobQueue";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { getReceivedFriendRequestWhere } from "#server/services/friend/getReceivedFriendRequestWhere";
import { readUserPair } from "#server/services/friend/readUserPair";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { friendUserIdInputSchema } from "#shared/models/db/friend/FriendUserIdInput";
import {
  AppNotificationType,
  blocksInSocial,
  DatabaseEntityType,
  FriendRequestInSocialRelations,
  friendRequestsInSocial,
  friendsInSocial,
  publishNotification,
  QueueJob,
  usersInAuth,
} from "@esposter/db-schema";
import { getFriendshipId, getResultAsync, noop, Operation } from "@esposter/shared";
import { and, eq, notExists, or, sql } from "drizzle-orm";

export const friendRequestRouter = router({
  acceptFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<PublicUser>(async ({ ctx, input: senderId }) => {
      const userId = ctx.getSessionPayload.user.id;
      const friendshipId = getFriendshipId(senderId, userId);
      // The sender is both the emit payload and the return value, so nothing fallible sits between the write and
      // The emit
      const [senderUser, receiverUser] = await readUserPair(ctx.db, senderId, userId);
      // The friendship is selected from the request row itself, so it exists only while that request stands for this
      // Receiver, and the request is deleted in the same batch: an accept lands whole or not at all
      const [insertedFriends] = await ctx.db.batch([
        ctx.db
          .insert(friendsInSocial)
          .select(
            ctx.db
              .select({
                ...getInsertSelectMetadata(friendsInSocial),
                id: friendRequestsInSocial.id,
                receiverId: friendRequestsInSocial.receiverId,
                senderId: friendRequestsInSocial.senderId,
              })
              .from(friendRequestsInSocial)
              .where(getReceivedFriendRequestWhere(friendshipId, userId)),
          )
          .returning(),
        ctx.db.delete(friendRequestsInSocial).where(getReceivedFriendRequestWhere(friendshipId, userId)),
      ]);
      requireMutation(insertedFriends[0], Operation.Update, DatabaseEntityType.Friend, friendshipId, "NOT_FOUND");
      await callUserObjects([senderId, userId], (userObject) =>
        userObject.acceptFriendRequest({ receiverUser, senderUser }),
      );
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
            .where(getReceivedFriendRequestWhere(friendshipId, userId))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.FriendRequest,
        friendshipId,
        "NOT_FOUND",
      );
      await callUserObjects([senderId, userId], (userObject) =>
        userObject.declineFriendRequest({ receiverId: userId, senderId }),
      );
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
      const [, senderUser] = await readUserPair(ctx.db, receiverId, userId);
      const friendshipId = getFriendshipId(userId, receiverId);
      // The request is only inserted while no block or friendship stands between the two users, so the check and the
      // Insert are one statement; a second request for the same pair is the conflict the insert ignores
      const [newFriendRequest] = await ctx.db
        .insert(friendRequestsInSocial)
        .select(
          ctx.db
            .select({
              ...getInsertSelectMetadata(friendRequestsInSocial),
              id: sql`${friendshipId}`,
              receiverId: sql`${receiverId}`,
              senderId: sql`${userId}`,
            })
            .from(usersInAuth)
            .where(
              and(
                eq(usersInAuth.id, receiverId),
                notExists(
                  ctx.db
                    .select({ _: sql`1` })
                    .from(blocksInSocial)
                    .where(
                      or(
                        and(eq(blocksInSocial.blockedId, receiverId), eq(blocksInSocial.blockerId, userId)),
                        and(eq(blocksInSocial.blockedId, userId), eq(blocksInSocial.blockerId, receiverId)),
                      ),
                    ),
                ),
                notExists(
                  ctx.db
                    .select({ _: sql`1` })
                    .from(friendsInSocial)
                    .where(eq(friendsInSocial.id, friendshipId)),
                ),
              ),
            ),
        )
        .onConflictDoNothing({ target: friendRequestsInSocial.id })
        .returning();
      if (!newFriendRequest) {
        // Nothing was inserted, so the refusal is read back in the order the insert's conditions were checked
        const existingBlock = await ctx.db.query.blocksInSocial.findFirst({
          where: {
            OR: [
              { blockedId: { eq: receiverId }, blockerId: { eq: userId } },
              { blockedId: { eq: userId }, blockerId: { eq: receiverId } },
            ],
          },
        });
        if (existingBlock) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Friend, receiverId);
        const existingFriend = await ctx.db.query.friendsInSocial.findFirst({ where: { id: { eq: friendshipId } } });
        if (existingFriend)
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId);
        const existingFriendRequest = await ctx.db.query.friendRequestsInSocial.findFirst({
          where: { id: { eq: friendshipId } },
          with: FriendRequestInSocialRelations,
        });
        if (existingFriendRequest?.senderId !== userId)
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId);
        return existingFriendRequest;
      }
      const friendRequest: FriendRequestInSocialWithRelations = { ...newFriendRequest, sender: senderUser };
      await callUserObjects([receiverId, userId], (userObject) => userObject.sendFriendRequest(friendRequest));
      // Best-effort after the insert — a failed publish loses one notification, never the friend request that
      // Already landed.
      await getResultAsync(() =>
        publishNotification(getJobQueue(QueueJob.ProcessNotification), {
          receiverId,
          senderId: userId,
          type: AppNotificationType.FriendRequest,
        }),
      ).match(noop, console.error);
      return friendRequest;
    }),
});
