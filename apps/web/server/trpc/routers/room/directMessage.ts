/* oxlint-disable no-await-in-loop -- Each step reads the last: every check reads the participants the adds before it joined */
import type { DirectMessageParticipants } from "#shared/models/db/room/DirectMessageParticipants";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { inJsonArray } from "@esposter/db";
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { getCursorWhere } from "#server/services/pagination/cursor/getCursorWhere";
import { announceRoomMemberDeparture } from "#server/services/room/announceRoomMemberDeparture";
import { announceRoomMembersJoined } from "#server/services/room/announceRoomMembersJoined";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { assertIsRoom } from "#server/services/room/assertIsRoom";
import { D1_MAX_BOUND_PARAMETERS } from "#server/services/db/constants";
import { assertCanCreateDirectMessageParticipant } from "#server/services/room/directMessage/assertCanCreateDirectMessageParticipant";
import { getDirectMessageParticipantKey } from "#server/services/room/directMessage/getDirectMessageParticipantKey";
import { readDirectMessageParticipantIds } from "#server/services/room/directMessage/readDirectMessageParticipantIds";
import { updateDirectMessageParticipantKey } from "#server/services/room/directMessage/updateDirectMessageParticipantKey";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { readJoinedRoomsPage } from "#server/services/room/readJoinedRoomsPage";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createDirectMessageInputSchema } from "#shared/models/db/room/CreateDirectMessageInput";
import { createDirectMessageParticipantsInputSchema } from "#shared/models/db/room/CreateDirectMessageParticipantsInput";
import { deleteDirectMessageParticipantInputSchema } from "#shared/models/db/room/DeleteDirectMessageParticipantInput";
import { hideDirectMessageInputSchema } from "#shared/models/db/room/HideDirectMessageInput";
import { readDirectMessagesInputSchema } from "#shared/models/db/room/ReadDirectMessagesInput";
import { roomIdsInputSchema } from "#shared/models/db/room/RoomIdsInput";
import {
  DatabaseEntityType,
  DerivedDatabaseEntityType,
  friendsInSocial,
  getDisplayNameExpression,
  getPublicUserColumns,
  PublicUserColumns,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { chunk, getOrCreate, noop, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, exists, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

export const directMessageRouter = router({
  createDirectMessage: standardAuthedProcedure
    .input(createDirectMessageInputSchema)
    .mutation<RoomInMessage>(async ({ ctx, input }) => {
      const userId = ctx.getSessionPayload.user.id;
      const allUserIds = [...new Set([userId, ...input])];
      const targetUserIds = allUserIds.filter((id) => id !== userId);
      if (targetUserIds.length === 0)
        throw getInvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, userId);

      const acceptedFriendships = await ctx.db
        .select()
        .from(friendsInSocial)
        .where(
          or(
            and(eq(friendsInSocial.senderId, userId), inJsonArray(friendsInSocial.receiverId, targetUserIds)),
            and(eq(friendsInSocial.receiverId, userId), inJsonArray(friendsInSocial.senderId, targetUserIds)),
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
        ...chunk(allUserIds, Math.floor(D1_MAX_BOUND_PARAMETERS / 2)).map((userIdChunk) =>
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
        const participants = await ctx.db.query.usersInAuth.findMany({
          columns: PublicUserColumns,
          where: { id: { in: allUserIds } },
        });
        await announceRoomMembersJoined(ctx.db, room.id, participants);
      }
      return room;
    }),
  createDirectMessageParticipants: getMemberProcedure(createDirectMessageParticipantsInputSchema, "roomId").mutation<
    PublicUser[]
  >(async ({ ctx, input: { roomId, userIds } }) => {
    const actorUser = ctx.getSessionPayload.user;
    await assertIsRoom(ctx.db, roomId, RoomType.DirectMessage);
    const participantIds = await readDirectMessageParticipantIds(ctx.db, roomId);
    const addedUsers: PublicUser[] = [];

    // Every check reads the participants the adds before it joined, and none of them writes, so the checks run ahead of
    // The batch that writes the memberships and the key they add up to
    for (const userId of userIds) {
      if (participantIds.includes(userId))
        throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, userId);
      await assertCanCreateDirectMessageParticipant(ctx.db, actorUser.id, participantIds, userId);
      const targetUser = await requireEntity(
        ctx.db.query.usersInAuth.findFirst({ columns: PublicUserColumns, where: { id: { eq: userId } } }),
        DatabaseEntityType.User,
        userId,
      );
      participantIds.push(userId);
      addedUsers.push(targetUser);
    }

    // A re-added member is upserted back to visible, and the key names everyone the loop admitted, in one batch
    // Each added row binds its user, the room and the visibility, and the conflict's own reset adds one more to a statement
    const [updatedRoomRows] = await ctx.db.batch([
      updateDirectMessageParticipantKey(ctx.db, roomId, participantIds),
      ...chunk(addedUsers, Math.floor((D1_MAX_BOUND_PARAMETERS - 1) / 3)).map((addedUserChunk) =>
        ctx.db
          .insert(usersToRoomsInMessage)
          .values(addedUserChunk.map(({ id }) => ({ isHidden: false, roomId, userId: id })))
          .onConflictDoUpdate({
            set: { isHidden: false },
            target: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
          }),
      ),
    ]);
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
    const actorUser = ctx.getSessionPayload.user;
    await assertIsRoom(ctx.db, roomId, RoomType.DirectMessage);
    const room = await ctx.db.query.roomsInMessage.findFirst({
      columns: { userId: true },
      where: { id: { eq: roomId } },
    });
    // Discord's group direct message: anyone may leave it, and only its owner removes somebody else
    if (userId !== actorUser.id && room?.userId !== actorUser.id) throw new TRPCError({ code: "UNAUTHORIZED" });
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
    // The key is written first and only while the membership it drops still stands, so the membership's own delete,
    // Which follows in the same batch, is the one that removes exactly the row the key was written against
    const [updatedRoomRows, deletedUserToRoomRows] = await ctx.db.batch([
      updateDirectMessageParticipantKey(
        ctx.db,
        roomId,
        remainingParticipantIds,
        room?.userId === userId ? nextOwnerId : undefined,
        exists(
          ctx.db
            .select({ _: sql`1` })
            .from(usersToRoomsInMessage)
            .where(getRoomMembershipWhere(roomId, userId)),
        ),
      ),
      ctx.db.delete(usersToRoomsInMessage).where(getRoomMembershipWhere(roomId, userId)).returning(),
    ]);
    requireMutation(
      deletedUserToRoomRows[0],
      Operation.Delete,
      DatabaseEntityType.UserToRoom,
      JSON.stringify({ roomId, userId }),
    );
    requireMutation(updatedRoomRows[0], Operation.Update, DerivedDatabaseEntityType.DirectMessage, roomId);

    await announceRoomMemberDeparture({ roomId, userId });
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
      await assertIsMember(ctx.db, ctx.getSessionPayload, input);
      await assertIsRoom(ctx.db, input, RoomType.DirectMessage);
      await ctx.db
        .update(usersToRoomsInMessage)
        .set({ isHidden: true })
        .where(getRoomMembershipWhere(input, ctx.getSessionPayload.user.id));
    }),
  readDirectMessageParticipants: standardAuthedProcedure
    .input(roomIdsInputSchema)
    .query<DirectMessageParticipants[]>(async ({ ctx, input: roomIds }) => {
      const usersToRoomsInMessage1 = alias(usersToRoomsInMessage, "usersToRoomsInMessage1");
      const usersToRoomsInMessage2 = alias(usersToRoomsInMessage, "usersToRoomsInMessage2");
      const usersInAuth2 = alias(usersInAuth, "usersInAuth2");
      const participantDisplayName = getDisplayNameExpression(usersToRoomsInMessage2, usersInAuth2);
      const rows = await ctx.db
        .select({
          displayName: participantDisplayName,
          roomId: usersToRoomsInMessage2.roomId,
          user: getPublicUserColumns(usersInAuth2),
        })
        .from(usersToRoomsInMessage1)
        .innerJoin(
          roomsInMessage,
          and(eq(roomsInMessage.id, usersToRoomsInMessage1.roomId), eq(roomsInMessage.type, RoomType.DirectMessage)),
        )
        .innerJoin(
          usersToRoomsInMessage2,
          and(
            eq(usersToRoomsInMessage2.roomId, usersToRoomsInMessage1.roomId),
            ne(usersToRoomsInMessage2.userId, ctx.getSessionPayload.user.id),
          ),
        )
        .innerJoin(usersInAuth2, eq(usersInAuth2.id, usersToRoomsInMessage2.userId))
        .where(
          and(
            eq(usersToRoomsInMessage1.userId, ctx.getSessionPayload.user.id),
            inJsonArray(usersToRoomsInMessage1.roomId, roomIds),
          ),
        )
        .orderBy(asc(participantDisplayName), asc(usersInAuth2.id));
      const roomIdParticipantsMap = new Map<string, DirectMessageParticipants["participants"]>();
      for (const { displayName, roomId, user } of rows)
        getOrCreate(roomIdParticipantsMap, roomId, () => []).push({ ...user, displayName });
      return Array.from(roomIdParticipantsMap, ([roomId, participants]) => ({ participants, roomId }));
    }),
  readDirectMessages: standardAuthedProcedure
    .input(readDirectMessagesInputSchema)
    .query<CursorPaginationData<RoomInMessage>>(({ ctx, input: { cursor, limit, sortBy } }) => {
      const innerJoinCondition = and(
        eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
        eq(usersToRoomsInMessage.userId, ctx.getSessionPayload.user.id),
        eq(usersToRoomsInMessage.isHidden, false),
      );
      const wheres: (SQL | undefined)[] = [eq(roomsInMessage.type, RoomType.DirectMessage)];
      if (cursor) wheres.push(getCursorWhere(roomsInMessage, cursor, sortBy));

      return readJoinedRoomsPage(ctx.db, innerJoinCondition, wheres, limit, sortBy);
    }),
});
