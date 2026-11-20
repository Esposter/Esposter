import type { DirectMessageParticipants } from "#shared/models/db/room/DirectMessageParticipants";
import type { Page, PublicUser, RoomInMessage } from "@esposter/db-schema";

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

      // The room is inserted unless one already holds this participant set. The memberships name their room by that
      // Key rather than by an id this request generated, so they land on whichever room the key belongs to, and the
      // Room is read back at the end of the same batch
      const participantKey = getDirectMessageParticipantKey(allUserIds);
      const participantRoomId = sql`(select ${roomsInMessage.id} from ${roomsInMessage} where ${roomsInMessage.participantKey} = ${participantKey})`;
      // Each membership row binds its room's key and its user, so a statement takes as many rows as that leaves room for
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
            .onConflictDoNothing(),
        ),
        ctx.db
          .update(usersToRoomsInMessage)
          .set({ isHidden: false })
          .where(and(eq(usersToRoomsInMessage.userId, userId), eq(usersToRoomsInMessage.roomId, participantRoomId))),
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
    // The key is read before the participants it names, so a change landing between the two reads is one the write refuses
    const { participantKey } = await requireEntity(
      ctx.db.query.roomsInMessage.findFirst({ columns: { participantKey: true }, where: { id: { eq: roomId } } }),
      DatabaseEntityType.Room,
      roomId,
    );
    const participantIds = await readDirectMessageParticipantIds(ctx.db, roomId);
    const addedUsers = await readAddableDirectMessageParticipants(ctx.db, actorUser.id, participantIds, userIds);
    const addedUserIds = addedUsers.map(({ id }) => id);

    // The memberships and the key are one batch, and both are written only while the room still holds the key the list
    // Is computed from. A refused key inserts no membership, so the key and the memberships it names land together or not at all
    const isRoomKeyUnchanged = getParticipantKeyUnchangedWhere(ctx.db, roomId, participantKey);
    // A re-added member is upserted back to visible. The added users are bound once, as a JSON array, so the statement
    // Takes any number of them
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
          .onConflictDoUpdate({
            set: { isHidden: false },
            target: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
          }),
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
  ).mutation<PublicUser>(async ({ ctx, input: { roomId, userId } }) => {
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
    // The owner leaving hands the group to the next participant, since the owner's permissions are checked without
    // Looking for a membership and a departed owner would otherwise keep every gate on a conversation they are not in
    const [nextOwnerId] = remainingParticipantIds;
    // The membership and the key are one batch under the same guard as the add: both are written only while the room still
    // Holds the key the list is computed from, so a refused key leaves the membership in place
    const isRoomKeyUnchanged = getParticipantKeyUnchangedWhere(ctx.db, roomId, room.participantKey);
    const [deletedUserToRoomRows, updatedRoomRows] = await runParticipantBatch(() =>
      ctx.db.batch([
        ctx.db
          .delete(usersToRoomsInMessage)
          .where(and(getRoomMembershipWhere(roomId, userId), isRoomKeyUnchanged))
          .returning(),
        updateDirectMessageParticipantKey(
          ctx.db,
          roomId,
          isRoomKeyUnchanged,
          remainingParticipantIds,
          checkIsRoomOwner(room, userId) ? nextOwnerId : undefined,
        ),
      ]),
    );
    const updatedRoom = requireMutation(
      updatedRoomRows[0],
      Operation.Update,
      DerivedDatabaseEntityType.DirectMessage,
      roomId,
    );
    requireMutation(
      deletedUserToRoomRows[0],
      Operation.Delete,
      DatabaseEntityType.UserToRoom,
      JSON.stringify({ roomId, userId }),
    );

    await announceRoomMemberDeparture({ roomId, userId });
    // A departed owner hands the group on, and the members still in it learn the new owner the way a room update tells them
    if (updatedRoom.userId !== room.userId)
      await notifyOnlineRoomMembers(roomId, { data: { id: roomId, userId: updatedRoom.userId }, type: "updateRoom" });
    await createSystemRoomMessage(
      roomId,
      actorUser.id,
      userId === actorUser.id
        ? `${targetUser.name} left the group.`
        : `${targetUser.name} was removed by ${actorUser.name}.`,
    ).match(noop, console.error);
    return targetUser;
  }),
  hideDirectMessage: standardAuthedProcedure
    .input(hideDirectMessageInputSchema)
    .mutation<void>(async ({ ctx, input }) => {
      await assertIsMember(ctx, input);
      await assertIsRoom(ctx.db, input, RoomType.DirectMessage);
      await ctx.db
        .update(usersToRoomsInMessage)
        .set({ isHidden: true })
        .where(getRoomMembershipWhere(input, ctx.user.id));
    }),
  readDirectMessages: standardAuthedProcedure
    .input(readDirectMessagesInputSchema)
    .query<Page<RoomInMessage> & { participants: DirectMessageParticipants[] }>(
      async ({ ctx, input: { cursor, limit } }) => {
        const innerJoinCondition = and(
          eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
          eq(usersToRoomsInMessage.userId, ctx.user.id),
          eq(usersToRoomsInMessage.isHidden, false),
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
