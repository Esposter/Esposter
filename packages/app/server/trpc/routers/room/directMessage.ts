import type { RoomInMessage, User } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { createDirectMessageInputSchema } from "#shared/models/db/room/CreateDirectMessageInput";
import { createDirectMessageParticipantsInputSchema } from "#shared/models/db/room/CreateDirectMessageParticipantsInput";
import { deleteDirectMessageParticipantInputSchema } from "#shared/models/db/room/DeleteDirectMessageParticipantInput";
import { hideDirectMessageInputSchema } from "#shared/models/db/room/HideDirectMessageInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { createSystemRoomMessage } from "@@/server/services/message/createSystemRoomMessage";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { assertIsRoom } from "@@/server/services/room/assertIsRoom";
import { assertCanCreateDirectMessageParticipant } from "@@/server/services/room/directMessage/assertCanCreateDirectMessageParticipant";
import { getDirectMessageParticipantKey } from "@@/server/services/room/directMessage/getDirectMessageParticipantKey";
import { readDirectMessageParticipantIds } from "@@/server/services/room/directMessage/readDirectMessageParticipantIds";
import { updateDirectMessageParticipantKey } from "@@/server/services/room/directMessage/updateDirectMessageParticipantKey";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import {
  DatabaseEntityType,
  DerivedDatabaseEntityType,
  friends,
  roomsInMessage,
  RoomType,
  selectRoomInMessageSchema,
  users,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, ItemMetadataPropertyNames, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getColumns, inArray, ne, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";

const readDirectMessagesInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectRoomInMessageSchema.keyof(), [
      { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
    ]).shape,
  })
  .prefault({});
const readDirectMessageParticipantsInputSchema = selectRoomInMessageSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);

export const directMessageRouter = router({
  createDirectMessage: standardAuthedProcedure
    .input(createDirectMessageInputSchema)
    .mutation<RoomInMessage>(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const userId = ctx.getSessionPayload.user.id;
        const allUserIds = [...new Set([userId, ...input])];
        const targetUserIds = allUserIds.filter((id) => id !== userId);
        if (targetUserIds.length === 0)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, userId)
              .message,
          });

        const acceptedFriendships = await tx
          .select()
          .from(friends)
          .where(
            or(
              and(eq(friends.senderId, userId), inArray(friends.receiverId, targetUserIds)),
              and(eq(friends.receiverId, userId), inArray(friends.senderId, targetUserIds)),
            ),
          );
        if (acceptedFriendships.length !== targetUserIds.length)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, userId)
              .message,
          });

        const participantKey = getDirectMessageParticipantKey(allUserIds);
        const [newRoom] = await tx
          .insert(roomsInMessage)
          .values({ participantKey, type: RoomType.DirectMessage, userId })
          .onConflictDoNothing({ target: roomsInMessage.participantKey })
          .returning();
        const room = requireMutation(
          newRoom ?? (await tx.query.roomsInMessage.findFirst({ where: { participantKey: { eq: participantKey } } })),
          Operation.Create,
          DerivedDatabaseEntityType.DirectMessage,
          participantKey,
        );

        await tx
          .insert(usersToRoomsInMessage)
          .values(allUserIds.map((userId) => ({ roomId: room.id, userId })))
          .onConflictDoNothing();
        await tx
          .update(usersToRoomsInMessage)
          .set({ isHidden: false })
          .where(and(eq(usersToRoomsInMessage.roomId, room.id), eq(usersToRoomsInMessage.userId, userId)));
        return room;
      }),
    ),
  createDirectMessageParticipants: getMemberProcedure(createDirectMessageParticipantsInputSchema, "roomId").mutation<
    User[]
  >(async ({ ctx, input: { roomId, userIds } }) => {
    const actorUser = ctx.getSessionPayload.user;
    const { targetUsers, updatedRoom } = await ctx.db.transaction(async (tx) => {
      await assertIsRoom(tx, roomId, RoomType.DirectMessage);
      let participantIds = await readDirectMessageParticipantIds(tx, roomId);
      const targetUsers: User[] = [];

      for (const userId of userIds) {
        if (participantIds.includes(userId))
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, userId).message,
          });
        await assertCanCreateDirectMessageParticipant(tx, actorUser.id, participantIds, userId);
        const targetUser = await requireEntity(
          tx.query.users.findFirst({ where: { id: { eq: userId } } }),
          DatabaseEntityType.User,
          userId,
        );
        requireMutation(
          (
            await tx
              .insert(usersToRoomsInMessage)
              .values({ isHidden: false, roomId, userId })
              .onConflictDoUpdate({
                set: { isHidden: false },
                target: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
              })
              .returning()
          )[0],
          Operation.Create,
          DatabaseEntityType.UserToRoom,
          JSON.stringify({ roomId, userId }),
        );
        participantIds = [...participantIds, userId];
        targetUsers.push(targetUser);
      }

      const updatedRoom = requireMutation(
        (await updateDirectMessageParticipantKey(tx, roomId, participantIds))[0],
        Operation.Update,
        DerivedDatabaseEntityType.DirectMessage,
        roomId,
      );
      return { targetUsers, updatedRoom };
    });

    for (const targetUser of targetUsers)
      roomEventEmitter.emit("joinRoom", { roomId, sessionId: ctx.getSessionPayload.session.id, user: targetUser });
    roomEventEmitter.emit("updateRoom", updatedRoom);
    await Promise.all(
      targetUsers.map((targetUser) =>
        createSystemRoomMessage(
          roomId,
          actorUser.id,
          `${targetUser.name} was added by ${actorUser.name}.`,
          ctx.getSessionPayload.session.id,
        ),
      ),
    );
    return targetUsers;
  }),
  deleteDirectMessageParticipant: getMemberProcedure(
    deleteDirectMessageParticipantInputSchema,
    "roomId",
  ).mutation<User>(async ({ ctx, input: { roomId, userId } }) => {
    const actorUser = ctx.getSessionPayload.user;
    const { targetUser, updatedRoom } = await ctx.db.transaction(async (tx) => {
      await assertIsRoom(tx, roomId, RoomType.DirectMessage);
      const participantIds = await readDirectMessageParticipantIds(tx, roomId);
      if (!participantIds.includes(userId))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.UserToRoom, userId).message,
        });

      const targetUser = await requireEntity(
        tx.query.users.findFirst({ where: { id: { eq: userId } } }),
        DatabaseEntityType.User,
        userId,
      );
      requireMutation(
        (
          await tx
            .delete(usersToRoomsInMessage)
            .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.UserToRoom,
        JSON.stringify({ roomId, userId }),
      );
      const updatedRoom = requireMutation(
        (
          await updateDirectMessageParticipantKey(
            tx,
            roomId,
            participantIds.filter((id) => id !== userId),
          )
        )[0],
        Operation.Update,
        DerivedDatabaseEntityType.DirectMessage,
        roomId,
      );
      return { targetUser, updatedRoom };
    });
    roomEventEmitter.emit("leaveRoom", {
      roomId,
      sessionId: ctx.getSessionPayload.session.id,
      userId,
    });
    roomEventEmitter.emit("updateRoom", updatedRoom);
    await createSystemRoomMessage(
      roomId,
      actorUser.id,
      userId === actorUser.id
        ? `${targetUser.name} left the group.`
        : `${targetUser.name} was removed by ${actorUser.name}.`,
      ctx.getSessionPayload.session.id,
    );
    return targetUser;
  }),
  hideDirectMessage: standardAuthedProcedure.input(hideDirectMessageInputSchema).mutation(async ({ ctx, input }) => {
    await isMember(ctx.db, ctx.getSessionPayload, input);
    await assertIsRoom(ctx.db, input, RoomType.DirectMessage);
    await ctx.db
      .update(usersToRoomsInMessage)
      .set({ isHidden: true })
      .where(
        and(eq(usersToRoomsInMessage.roomId, input), eq(usersToRoomsInMessage.userId, ctx.getSessionPayload.user.id)),
      );
  }),
  readDirectMessageParticipants: standardAuthedProcedure
    .input(readDirectMessageParticipantsInputSchema)
    .query(async ({ ctx, input: roomIds }) => {
      const utr1 = alias(usersToRoomsInMessage, "utr1");
      const utr2 = alias(usersToRoomsInMessage, "utr2");
      const rows = await ctx.db
        .select({ roomId: utr2.roomId, user: users })
        .from(utr1)
        .innerJoin(
          roomsInMessage,
          and(eq(roomsInMessage.id, utr1.roomId), eq(roomsInMessage.type, RoomType.DirectMessage)),
        )
        .innerJoin(utr2, and(eq(utr2.roomId, utr1.roomId), ne(utr2.userId, ctx.getSessionPayload.user.id)))
        .innerJoin(users, eq(users.id, utr2.userId))
        .where(and(eq(utr1.userId, ctx.getSessionPayload.user.id), inArray(utr1.roomId, roomIds)));
      const participantsMap = new Map<string, User[]>();
      for (const { roomId, user } of rows) {
        const existingParticipants = participantsMap.get(roomId) ?? [];
        existingParticipants.push(user);
        participantsMap.set(roomId, existingParticipants);
      }
      return Array.from(participantsMap, ([roomId, participants]) => ({ participants, roomId }));
    }),
  readDirectMessages: standardAuthedProcedure
    .input(readDirectMessagesInputSchema)
    .query(async ({ ctx, input: { cursor, limit, sortBy } }) => {
      const innerJoinCondition = and(
        eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
        eq(usersToRoomsInMessage.userId, ctx.getSessionPayload.user.id),
        eq(usersToRoomsInMessage.isHidden, false),
      );
      const wheres: (SQL | undefined)[] = [eq(roomsInMessage.type, RoomType.DirectMessage)];
      if (cursor) wheres.push(getCursorWhere(roomsInMessage, cursor, sortBy));

      const readRooms = await ctx.db
        .select(getColumns(roomsInMessage))
        .from(roomsInMessage)
        .innerJoin(usersToRoomsInMessage, innerJoinCondition)
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(roomsInMessage, sortBy))
        .limit(limit + 1);
      return getCursorPaginationData(readRooms, limit, sortBy);
    }),
});
