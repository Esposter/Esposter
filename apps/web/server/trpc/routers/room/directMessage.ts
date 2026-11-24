import type { DirectMessageParticipants } from "#shared/models/db/room/DirectMessageParticipants";
import type { MemberRow } from "#shared/models/db/room/MemberRow";
import type { Page, PublicUser, RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";

import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { announceRoomMemberDeparture } from "#server/services/room/announceRoomMemberDeparture";
import { announceRoomMembersJoined } from "#server/services/room/announceRoomMembersJoined";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { assertIsRoom } from "#server/services/room/assertIsRoom";
import { getDirectMessageParticipantKey } from "#server/services/room/directMessage/getDirectMessageParticipantKey";
import { getParticipantKeyUnchangedWhere } from "#server/services/room/directMessage/getParticipantKeyUnchangedWhere";
import { readAddableDirectMessageParticipants } from "#server/services/room/directMessage/readAddableDirectMessageParticipants";
import { readDirectMessageParticipantIds } from "#server/services/room/directMessage/readDirectMessageParticipantIds";
import { readDirectMessageParticipants } from "#server/services/room/directMessage/readDirectMessageParticipants";
import { runParticipantBatch } from "#server/services/room/directMessage/runParticipantBatch";
import { updateDirectMessageParticipantKey } from "#server/services/room/directMessage/updateDirectMessageParticipantKey";
import { getReviveMembershipConflict } from "#server/services/room/getReviveMembershipConflict";
import { getRoomMembershipRemoval } from "#server/services/room/getRoomMembershipRemoval";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { notifyOnlineRoomMembers } from "#server/services/room/notifyOnlineRoomMembers";
import { checkIsRoomOwner } from "#server/services/room/rbac/checkIsRoomOwner";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createDirectMessageInputSchema } from "#shared/models/db/room/CreateDirectMessageInput";
import { createDirectMessageParticipantsInputSchema } from "#shared/models/db/room/CreateDirectMessageParticipantsInput";
import { deleteDirectMessageParticipantInputSchema } from "#shared/models/db/room/DeleteDirectMessageParticipantInput";
import { hideDirectMessageInputSchema } from "#shared/models/db/room/HideDirectMessageInput";
import { DIRECT_MESSAGE_SORT, readDirectMessagesInputSchema } from "#shared/models/db/room/ReadDirectMessagesInput";
import { createPageSort, getPageOrderBy, getPageWhere, getRowsPerStatement, inJsonArray, toPage } from "@esposter/db";
import {
  DatabaseEntityType,
  DerivedDatabaseEntityType,
  friendsInSocial,
  getLiveRowWhere,
  getPublicUserColumns,
  PublicUserColumns,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { chunk, noop, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getColumns, isNull, or, sql } from "drizzle-orm";

export const directMessageRouter = router({
  createDirectMessage: standardAuthedProcedure
    .input(createDirectMessageInputSchema)
    .mutation<RoomInMessage>(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const allUserIds = [...new Set([userId, ...input])];
      const targetUserIds = allUserIds.filter((id) => id !== userId);
      if (targetUserIds.length === 0)
        throw getInvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, userId);

      const acceptedFriendships = await ctx.db
        .select()
        .from(friendsInSocial)
        .where(
          and(
            isNull(friendsInSocial.deletedAt),
            or(
              and(eq(friendsInSocial.senderId, userId), inJsonArray(friendsInSocial.receiverId, targetUserIds)),
              and(eq(friendsInSocial.receiverId, userId), inJsonArray(friendsInSocial.senderId, targetUserIds)),
            ),
          ),
        );
      if (acceptedFriendships.length !== targetUserIds.length)
        throw getInvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, userId);

      // The room is inserted unless one already holds this participant set.
      // The memberships name their room by its key, rather than by an id this request generated.
      // So they land on whichever room the key belongs to, and the room is read back at the end of the same batch.
      const participantKey = getDirectMessageParticipantKey(allUserIds);
      const participantRoomId = sql`(select ${roomsInMessage.id} from ${roomsInMessage} where ${roomsInMessage.participantKey} = ${participantKey})`;
      // Each membership row binds its room's key and its user, so the rows can be chunked per statement.
      const [insertedRoomRows] = await ctx.db.batch([
        ctx.db
          .insert(roomsInMessage)
          .values({ participantKey, type: RoomType.DirectMessage, userId })
          .onConflictDoNothing({ target: roomsInMessage.participantKey })
          .returning({ id: roomsInMessage.id }),
        ...chunk(allUserIds, getRowsPerStatement(usersToRoomsInMessage)).map((userIdChunk) =>
          ctx.db
            .insert(usersToRoomsInMessage)
            .values(userIdChunk.map((participantUserId) => ({ roomId: participantRoomId, userId: participantUserId })))
            .onConflictDoUpdate(getReviveMembershipConflict()),
        ),
        ctx.db
          .update(usersToRoomsInMessage)
          .set({ isHidden: false })
          .where(
            and(
              eq(usersToRoomsInMessage.userId, userId),
              eq(usersToRoomsInMessage.roomId, participantRoomId),
              getLiveRowWhere(usersToRoomsInMessage),
            ),
          ),
      ]);
      const room = requireMutation(
        await ctx.db.query.roomsInMessage.findFirst({ where: { participantKey: { eq: participantKey } } }),
        Operation.Create,
        DerivedDatabaseEntityType.DirectMessage,
        participantKey,
      );
      // Only a room the batch created is new to its participants. One that already held the set is returned as it was
      if (insertedRoomRows.length > 0) {
        const participants = await ctx.db
          .select(getPublicUserColumns(usersInAuth))
          .from(usersInAuth)
          .where(inJsonArray(usersInAuth.id, allUserIds));
        await announceRoomMembersJoined(ctx.db, room.id, participants);
      }
      return room;
    }),
  createDirectMessageParticipants: getMemberProcedure(createDirectMessageParticipantsInputSchema, "roomId").mutation<
    PublicUser[]
  >(async ({ ctx, input: { roomId, userIds } }) => {
    const actorUser = ctx.user;
    await assertIsRoom(ctx.db, roomId, RoomType.DirectMessage);
    // The key is read before the participants it names.
    // A change landing between the two reads is one the write refuses.
    const { participantKey } = await requireEntity(
      ctx.db.query.roomsInMessage.findFirst({ columns: { participantKey: true }, where: { id: { eq: roomId } } }),
      DatabaseEntityType.Room,
      roomId,
    );
    const participantIds = await readDirectMessageParticipantIds(ctx.db, roomId);
    const addedUsers = await readAddableDirectMessageParticipants(ctx.db, actorUser.id, participantIds, userIds);
    const addedUserIds = addedUsers.map(({ id }) => id);

    // The memberships and the key are one batch, and both are written only while the room still holds the key.
    // The list is computed from that key.
    // A refused key inserts no membership, so the key and the memberships it names land together or not at all.
    const isRoomKeyUnchanged = getParticipantKeyUnchangedWhere(ctx.db, roomId, participantKey);
    // A re-added member is revived from the tombstone their removal left, as a fresh membership.
    // The added users are bound once, as a JSON array, so the statement takes any number of them.
    const [, updatedRoomRows] = await runParticipantBatch(() =>
      ctx.db.batch([
        ctx.db
          .insert(usersToRoomsInMessage)
          .select(
            ctx.db
              .select({
                ...getInsertSelectMetadata(usersToRoomsInMessage),
                roomId: sql<string>`${roomId}`.as("roomId"),
                userId: sql<string>`participant.value`.as("userId"),
              })
              .from(sql`json_each(${JSON.stringify(addedUserIds)}) AS participant`)
              .where(isRoomKeyUnchanged),
          )
          .onConflictDoUpdate(getReviveMembershipConflict()),
        updateDirectMessageParticipantKey(ctx.db, roomId, isRoomKeyUnchanged, [...participantIds, ...addedUserIds]),
      ]),
    );
    requireMutation(updatedRoomRows[0], Operation.Update, DerivedDatabaseEntityType.DirectMessage, roomId);

    await announceRoomMembersJoined(ctx.db, roomId, addedUsers);
    await Promise.all(
      addedUsers.map((targetUser) =>
        createSystemRoomMessage(roomId, actorUser.id, `${targetUser.name} was added by ${actorUser.name}.`).match(
          noop,
          console.error,
        ),
      ),
    );
    return addedUsers;
  }),
  deleteDirectMessageParticipant: getMemberProcedure(
    deleteDirectMessageParticipantInputSchema,
    "roomId",
  ).mutation<MemberRow>(async ({ ctx, input: { roomId, userId } }) => {
    const actorUser = ctx.user;
    await assertIsRoom(ctx.db, roomId, RoomType.DirectMessage);
    // The key is read with the owner and before the participants it names, as the add reads it
    const room = await requireEntity(
      ctx.db.query.roomsInMessage.findFirst({
        columns: { participantKey: true, userId: true },
        where: { id: { eq: roomId } },
      }),
      DatabaseEntityType.Room,
      roomId,
    );
    // Discord's group direct message: anyone may leave it, and only its owner removes somebody else
    if (userId !== actorUser.id && !checkIsRoomOwner(room, actorUser.id)) throw new TRPCError({ code: "UNAUTHORIZED" });
    const participantIds = await readDirectMessageParticipantIds(ctx.db, roomId);
    if (!participantIds.includes(userId))
      throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.UserToRoom, userId);
    const remainingParticipantIds = participantIds.filter((id) => id !== userId);

    const targetUser = await requireEntity(
      ctx.db.query.usersInAuth.findFirst({ columns: PublicUserColumns, where: { id: { eq: userId } } }),
      DatabaseEntityType.User,
      userId,
    );
    // The owner leaving hands the group to the next participant.
    // The owner's permissions are checked without looking for a membership.
    // A departed owner would otherwise keep every gate on a conversation they are not in.
    const [nextOwnerId] = remainingParticipantIds;
    // The membership and the key are one batch under the same guard as the add.
    // Both are written only while the room still holds the key the list is computed from.
    // A refused key leaves the membership in place.
    const isRoomKeyUnchanged = getParticipantKeyUnchangedWhere(ctx.db, roomId, room.participantKey);
    // The membership, then the key, then the membership's cascade, so the batch's second result is the room.
    // The cascade reads the membership's own tombstone, which the guard lets through only while the key is unchanged.
    // A refused key leaves the children live too.
    const [membershipStatement, ...cascadeStatements] = getRoomMembershipRemoval(
      ctx.db,
      roomId,
      userId,
      isRoomKeyUnchanged,
    );
    const batchRows = await runParticipantBatch(() =>
      ctx.db.batch([
        membershipStatement,
        updateDirectMessageParticipantKey(
          ctx.db,
          roomId,
          isRoomKeyUnchanged,
          remainingParticipantIds,
          checkIsRoomOwner(room, userId) ? nextOwnerId : undefined,
        ),
        ...cascadeStatements,
      ]),
    );
    const [[deletedUserToRoom], updatedRoomRows] = batchRows;
    const updatedRoom = requireMutation(
      updatedRoomRows[0],
      Operation.Update,
      DerivedDatabaseEntityType.DirectMessage,
      roomId,
    );
    const removedUserToRoom = requireMutation(
      deletedUserToRoom,
      Operation.Delete,
      DatabaseEntityType.UserToRoom,
      JSON.stringify({ roomId, userId }),
    );

    await announceRoomMemberDeparture(removedUserToRoom);
    // A departed owner hands the group on, and the members still in it learn the new owner the way a room update tells
    // Them
    if (updatedRoom.userId !== room.userId)
      await notifyOnlineRoomMembers(roomId, { data: updatedRoom, type: "updateRoom" });
    await createSystemRoomMessage(
      roomId,
      actorUser.id,
      userId === actorUser.id
        ? `${targetUser.name} left the group.`
        : `${targetUser.name} was removed by ${actorUser.name}.`,
    ).match(noop, console.error);
    // The answer is the membership the removal tombstoned, as a member's row reads it: the removed member's own
    // Settings stay Private to them
    return {
      deletedAt: removedUserToRoom.deletedAt,
      displayName: removedUserToRoom.displayName,
      roomId,
      userId,
      version: removedUserToRoom.version,
    };
  }),
  hideDirectMessage: standardAuthedProcedure
    .input(hideDirectMessageInputSchema)
    .mutation<UserToRoomInMessage>(async ({ ctx, input }) => {
      await assertIsMember(ctx, input);
      await assertIsRoom(ctx.db, input, RoomType.DirectMessage);
      const hiddenUserToRoom = (
        await ctx.db
          .update(usersToRoomsInMessage)
          .set({ isHidden: true })
          .where(getRoomMembershipWhere(input, ctx.user.id))
          .returning()
      )[0];
      // The answer is the viewer's own membership, which the list drops by its isHidden at the version it names
      return requireMutation(
        hiddenUserToRoom,
        Operation.Update,
        DatabaseEntityType.UserToRoom,
        JSON.stringify({ roomId: input }),
      );
    }),
  readDirectMessages: standardAuthedProcedure
    .input(readDirectMessagesInputSchema)
    .query<{ participants: DirectMessageParticipants[] } & Page<RoomInMessage>>(
      async ({ ctx, input: { cursor, limit } }) => {
        const innerJoinCondition = and(
          eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
          eq(usersToRoomsInMessage.userId, ctx.user.id),
          eq(usersToRoomsInMessage.isHidden, false),
          getLiveRowWhere(usersToRoomsInMessage),
        );
        // The sort is bound to the room's own columns, so the cursor's values are read off the rows it answers
        const boundSort = createPageSort(
          { id: roomsInMessage.id, lastMessageAt: roomsInMessage.lastMessageAt },
          DIRECT_MESSAGE_SORT,
        );
        const rooms = await ctx.db
          .select(getColumns(roomsInMessage))
          .from(roomsInMessage)
          .innerJoin(usersToRoomsInMessage, innerJoinCondition)
          .where(and(eq(roomsInMessage.type, RoomType.DirectMessage), getPageWhere(boundSort, cursor)))
          .orderBy(...getPageOrderBy(boundSort, cursor))
          .limit(limit + 1);
        const page = toPage(rooms, DIRECT_MESSAGE_SORT, cursor, limit);
        // A direct message is named after its participants, so the page is answered with them in the same read: the
        // Statements of this read are the list's own, so its topics name the participants' memberships too
        const participants = await readDirectMessageParticipants(
          ctx.db,
          ctx.user.id,
          page.items.map(({ id }) => id),
        );
        return { ...page, participants };
      },
    ),
});
