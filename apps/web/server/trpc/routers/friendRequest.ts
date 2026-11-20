import type { FriendRequestInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { assertIsNotSelf } from "#server/services/friend/assertIsNotSelf";
import { getLiveBlockWhere } from "#server/services/friend/getLiveBlockWhere";
import { getLiveFriendshipWhere } from "#server/services/friend/getLiveFriendshipWhere";
import { getReceivedFriendRequestWhere } from "#server/services/friend/getReceivedFriendRequestWhere";
import { readUserPair } from "#server/services/friend/readUserPair";
import { getJobQueue } from "#server/services/queue/getJobQueue";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
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
import { and, eq, isNotNull, notExists, or, sql } from "drizzle-orm";

export const friendRequestRouter = router({
  acceptFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<PublicUser>(async ({ ctx, input: senderId }) => {
      const userId = ctx.user.id;
      const friendshipId = getFriendshipId(senderId, userId);
      const [senderUser] = await readUserPair(ctx.db, senderId, userId);
      // The friendship is selected from the request row itself, so it exists only while that request stands for this
      // Receiver, and the request is tombstoned in the same batch: an accept lands whole or not at all. A friendship that was
      // Removed is revived by the conflict branch, which clears its deletion and takes the request's direction
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
          .onConflictDoUpdate({
            set: {
              deletedAt: null,
              receiverId: sql`excluded.${sql.identifier(friendsInSocial.receiverId.name)}`,
              senderId: sql`excluded.${sql.identifier(friendsInSocial.senderId.name)}`,
            },
            setWhere: isNotNull(friendsInSocial.deletedAt),
            target: friendsInSocial.id,
          })
          .returning(),
        ctx.db
          .update(friendRequestsInSocial)
          .set({ deletedAt: new Date() })
          .where(getReceivedFriendRequestWhere(friendshipId, userId)),
      ]);
      requireMutation(insertedFriends[0], Operation.Update, DatabaseEntityType.Friend, friendshipId, "NOT_FOUND");
      return senderUser;
    }),
  declineFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<void>(async ({ ctx, input: senderId }) => {
      const userId = ctx.user.id;
      assertIsNotSelf(Operation.Delete, DatabaseEntityType.FriendRequest, userId, senderId);

      const friendshipId = getFriendshipId(senderId, userId);
      requireMutation(
        (
          await ctx.db
            .update(friendRequestsInSocial)
            .set({ deletedAt: new Date() })
            .where(getReceivedFriendRequestWhere(friendshipId, userId))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.FriendRequest,
        friendshipId,
        "NOT_FOUND",
      );
    }),
  // Declined and accepted requests stay in this read as tombstones, so the client applies their removal
  readFriendRequests: standardAuthedProcedure.query<FriendRequestInSocialWithRelations[]>(({ ctx }) => {
    const userId = ctx.user.id;
    return ctx.db.query.friendRequestsInSocial.findMany({
      where: { OR: [{ receiverId: { eq: userId } }, { senderId: { eq: userId } }] },
      with: FriendRequestInSocialRelations,
    });
  }),
  sendFriendRequest: standardAuthedProcedure
    .input(friendUserIdInputSchema)
    .mutation<FriendRequestInSocialWithRelations>(async ({ ctx, input: receiverId }) => {
      const userId = ctx.user.id;
      assertIsNotSelf(Operation.Create, DatabaseEntityType.Friend, userId, receiverId);
      const [, senderUser] = await readUserPair(ctx.db, receiverId, userId);
      const friendshipId = getFriendshipId(userId, receiverId);
      // The request is only inserted while no live block or friendship stands between the two users, so the check and the
      // Insert are one statement. A live request for the pair is the conflict left alone, and a removed one is revived by it
      const [newFriendRequest] = await ctx.db
        .insert(friendRequestsInSocial)
        .select(
          ctx.db
            .select({
              ...getInsertSelectMetadata(friendRequestsInSocial),
              id: sql`${friendshipId}`.as("id"),
              receiverId: sql`${receiverId}`.as("receiverId"),
              senderId: sql`${userId}`.as("senderId"),
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
                        getLiveBlockWhere({ blockedId: receiverId, blockerId: userId }),
                        getLiveBlockWhere({ blockedId: userId, blockerId: receiverId }),
                      ),
                    ),
                ),
                notExists(
                  ctx.db
                    .select({ _: sql`1` })
                    .from(friendsInSocial)
                    .where(getLiveFriendshipWhere(friendshipId)),
                ),
              ),
            ),
        )
        .onConflictDoUpdate({
          set: {
            deletedAt: null,
            receiverId: sql`excluded.${sql.identifier(friendRequestsInSocial.receiverId.name)}`,
            senderId: sql`excluded.${sql.identifier(friendRequestsInSocial.senderId.name)}`,
          },
          setWhere: isNotNull(friendRequestsInSocial.deletedAt),
          target: friendRequestsInSocial.id,
        })
        .returning();
      if (!newFriendRequest) {
        // Nothing was inserted, so the refusal is read back in the order the insert's conditions were checked
        const existingBlock = await ctx.db.query.blocksInSocial.findFirst({
          where: {
            deletedAt: { isNull: true },
            OR: [
              { blockedId: { eq: receiverId }, blockerId: { eq: userId } },
              { blockedId: { eq: userId }, blockerId: { eq: receiverId } },
            ],
          },
        });
        if (existingBlock) throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Friend, receiverId);
        const existingFriend = await ctx.db.query.friendsInSocial.findFirst({
          where: { deletedAt: { isNull: true }, id: { eq: friendshipId } },
        });
        if (existingFriend)
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId);
        const existingFriendRequest = await ctx.db.query.friendRequestsInSocial.findFirst({
          where: { deletedAt: { isNull: true }, id: { eq: friendshipId } },
          with: FriendRequestInSocialRelations,
        });
        if (existingFriendRequest?.senderId !== userId)
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.FriendRequest, friendshipId);
        return existingFriendRequest;
      }
      const friendRequest: FriendRequestInSocialWithRelations = { ...newFriendRequest, sender: senderUser };
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
