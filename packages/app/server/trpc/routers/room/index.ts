import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { RoomInMessage, User, UserToRoomInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { createRoomInputSchema } from "#shared/models/db/room/CreateRoomInput";
import { deleteMemberInputSchema } from "#shared/models/db/room/DeleteMemberInput";
import { deleteRoomInputSchema } from "#shared/models/db/room/DeleteRoomInput";
import { joinRoomInputSchema } from "#shared/models/db/room/JoinRoomInput";
import { leaveRoomInputSchema } from "#shared/models/db/room/LeaveRoomInput";
import { updateRoomInputSchema } from "#shared/models/db/room/UpdateRoomInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { createCode } from "#shared/util/math/random/createCode";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { on } from "@@/server/services/events/on";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { readInviteCode } from "@@/server/services/message/readInviteCode";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { assertIsRoom } from "@@/server/services/room/assertIsRoom";
import { deleteRoom } from "@@/server/services/room/deleteRoom";
import { router } from "@@/server/trpc";
import { addProfanityFilterMiddleware } from "@@/server/trpc/middleware/addProfanityFilterMiddleware";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { isRoom } from "@@/server/trpc/middleware/userToRoom/isRoom";
import { getProfanityFilterProcedure } from "@@/server/trpc/procedure/getProfanityFilterProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { createMessage, deleteDirectory } from "@esposter/db";
import {
  AzureContainer,
  AzureTable,
  CODE_LENGTH,
  DatabaseEntityType,
  InviteInMessageRelations,
  invitesInMessage,
  MessageType,
  roomIdSchema,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  selectInviteInMessageSchema,
  selectRoomInMessageSchema,
  selectUserSchema,
  users,
  usersToRoomsInMessage,
  UserToRoomInMessageRelations,
} from "@esposter/db-schema";
import {
  InvalidOperationError,
  ItemMetadataPropertyNames,
  normalizeString,
  NotFoundError,
  Operation,
  takeOne,
} from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getColumns, ilike, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";

const readRoomInputSchema = selectRoomInMessageSchema.shape.id.optional();
export type ReadRoomInput = z.infer<typeof readRoomInputSchema>;

const readMutualRoomsInputSchema = z.object({ userId: selectUserSchema.shape.id });
export type ReadMutualRoomsInput = z.infer<typeof readMutualRoomsInputSchema>;

const readRoomsInputSchema = z
  .object({
    roomId: selectRoomInMessageSchema.shape.id.optional(),
    ...createCursorPaginationParamsSchema(selectRoomInMessageSchema.keyof(), [
      { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
    ]).shape,
    filter: selectRoomInMessageSchema.pick({ name: true }).optional(),
  })
  .prefault({});
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;

const onUpdateRoomInputSchema = selectRoomInMessageSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnUpdateRoomInput = z.infer<typeof onUpdateRoomInputSchema>;

const onDeleteRoomInputSchema = selectRoomInMessageSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnDeleteRoomInput = z.infer<typeof onDeleteRoomInputSchema>;

const onJoinRoomInputSchema = selectRoomInMessageSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnJoinRoomInput = z.infer<typeof onJoinRoomInputSchema>;

const onLeaveRoomInputSchema = selectRoomInMessageSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnLeaveRoomInput = z.infer<typeof onLeaveRoomInputSchema>;

const readMembersInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectUserSchema.keyof(), [
    { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
  ]).shape,
  filter: selectUserSchema.pick({ name: true }).optional(),
});
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;

const readMembersByIdsInputSchema = z.object({
  ...roomIdSchema.shape,
  ids: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});
export type ReadMembersByIdsInput = z.infer<typeof readMembersByIdsInputSchema>;

const countMembersInputSchema = roomIdSchema;
export type CountMembersInput = z.infer<typeof countMembersInputSchema>;

const createMembersInputSchema = z.object({
  ...roomIdSchema.shape,
  userIds: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});
export type CreateMembersInput = z.infer<typeof createMembersInputSchema>;

const readInviteInputSchema = selectInviteInMessageSchema.shape.code;
export type ReadInviteInput = z.infer<typeof readInviteInputSchema>;

const readInviteCodeInputSchema = roomIdSchema;
export type ReadInviteCodeInput = z.infer<typeof readInviteCodeInputSchema>;

const createInviteInputSchema = roomIdSchema;
export type CreateInviteInput = z.infer<typeof createInviteInputSchema>;

export const roomRouter = router({
  countMembers: getMemberProcedure(countMembersInputSchema, "roomId").query(
    async ({ ctx, input: { roomId } }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(usersToRoomsInMessage)
          .where(eq(usersToRoomsInMessage.roomId, roomId)),
      ).count,
  ),
  createInvite: getMemberProcedure(createInviteInputSchema, "roomId")
    .use(isRoom)
    .mutation<string>(async ({ ctx, input: { roomId } }) => {
      let inviteCode = await readInviteCode(ctx.db, ctx.getSessionPayload.user.id, roomId, true);
      if (inviteCode) return inviteCode;

      for (let i = 0; i < 3; i++)
        try {
          inviteCode = createCode(CODE_LENGTH);
          await ctx.db
            .insert(invitesInMessage)
            .values({ code: inviteCode, roomId, userId: ctx.getSessionPayload.user.id });
          return inviteCode;
        } catch {
          continue;
        }
      throw new TRPCError({
        code: "UNPROCESSABLE_CONTENT",
        message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Invite, roomId).message,
      });
    }),
  createMembers: getPermissionsProcedure(RoomPermission.ManageRoom, createMembersInputSchema, "roomId")
    .use(isRoom)
    .mutation<UserToRoomInMessage[]>(async ({ ctx, input: { roomId, userIds } }) => {
      const newMembers = await ctx.db
        .insert(usersToRoomsInMessage)
        .values(userIds.map((userId) => ({ roomId, userId })))
        .returning();
      const createdMembers = await ctx.db.query.users.findMany({ where: { id: { in: userIds } } });
      try {
        const messageClient = await useTableClient(AzureTable.Messages);
        const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
        await Promise.all(
          createdMembers.map(async ({ name }) => {
            const systemMessage = await createMessage(messageClient, messageAscendingClient, {
              message: `${name} joined the room.`,
              roomId,
              type: MessageType.System,
              userId: ctx.getSessionPayload.user.id,
            });
            messageEventEmitter.emit("createMessage", [
              [systemMessage],
              { isSendToSelf: true, sessionId: ctx.getSessionPayload.session.id },
            ]);
          }),
        );
      } catch {}
      return newMembers;
    }),
  createRoom: getProfanityFilterProcedure(createRoomInputSchema, ["name"]).mutation<RoomInMessage>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const newRoom = (
        await tx
          .insert(roomsInMessage)
          .values({ ...input, userId: ctx.getSessionPayload.user.id })
          .returning()
      )[0];
      if (!newRoom)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Room, JSON.stringify(input)).message,
        });

      await Promise.all([
        tx.insert(usersToRoomsInMessage).values({ roomId: newRoom.id, userId: ctx.getSessionPayload.user.id }),
        tx.insert(roomRolesInMessage).values({
          isEveryone: true,
          name: "@everyone",
          permissions:
            RoomPermission.ReadMessages |
            RoomPermission.SendMessages |
            RoomPermission.MentionEveryone |
            RoomPermission.ManageInvites,
          position: 0,
          roomId: newRoom.id,
        }),
      ]);
      return newRoom;
    }),
  ),
  deleteMember: getPermissionsProcedure(RoomPermission.KickMembers, deleteMemberInputSchema, "roomId")
    .use(isRoom)
    .mutation(async ({ ctx, input: { roomId, userId } }) => {
      if (userId === ctx.getSessionPayload.user.id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Delete,
            DatabaseEntityType.UserToRoom,
            JSON.stringify({ roomId, userId }),
          ).message,
        });

      const [deletedMember, kickedMember] = await Promise.all([
        ctx.db
          .delete(usersToRoomsInMessage)
          .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)))
          .returning()
          .then((rows) => rows[0]),
        ctx.db.query.users.findFirst({ columns: { name: true }, where: { id: { eq: userId } } }),
      ]);
      if (!deletedMember)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Delete,
            DatabaseEntityType.UserToRoom,
            JSON.stringify({ roomId, userId }),
          ).message,
        });

      roomEventEmitter.emit("leaveRoom", { ...deletedMember, sessionId: ctx.getSessionPayload.session.id });

      if (kickedMember)
        try {
          const messageClient = await useTableClient(AzureTable.Messages);
          const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
          const systemMessage = await createMessage(messageClient, messageAscendingClient, {
            message: `${kickedMember.name} left the room.`,
            roomId,
            type: MessageType.System,
            userId: ctx.getSessionPayload.user.id,
          });
          messageEventEmitter.emit("createMessage", [
            [systemMessage],
            { isSendToSelf: true, sessionId: ctx.getSessionPayload.session.id },
          ]);
        } catch {}
    }),
  deleteRoom: standardAuthedProcedure.input(deleteRoomInputSchema).mutation<RoomInMessage>(async ({ ctx, input }) => {
    const deletedRoom = await deleteRoom(ctx.db, ctx.getSessionPayload, input);
    const containerClient = await useContainerClient(AzureContainer.MessageAssets);
    await deleteDirectory(containerClient, input, true);
    return deletedRoom;
  }),
  joinRoom: standardAuthedProcedure.input(joinRoomInputSchema).mutation<RoomInMessage>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const invite = await tx.query.invitesInMessage.findFirst({
        columns: {
          roomId: true,
        },
        where: {
          code: {
            eq: input,
          },
        },
      });
      if (!invite)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Invite, input).message,
        });

      await assertIsRoom(tx, invite.roomId);

      const ban = await tx.query.bansInMessage.findFirst({
        columns: { userId: true },
        where: {
          deletedAt: { isNull: true },
          roomId: { eq: invite.roomId },
          userId: { eq: ctx.getSessionPayload.user.id },
        },
      });
      if (ban) throw new TRPCError({ code: "FORBIDDEN" });

      const userToRoom = (
        await tx
          .insert(usersToRoomsInMessage)
          .values({ roomId: invite.roomId, userId: ctx.getSessionPayload.user.id })
          .returning()
      )[0];
      if (!userToRoom)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Create,
            DatabaseEntityType.UserToRoom,
            JSON.stringify({ roomId: invite.roomId, userId: ctx.getSessionPayload.user.id }),
          ).message,
        });

      const userToRoomWithRelations = await tx.query.usersToRoomsInMessage.findFirst({
        where: {
          roomId: {
            eq: userToRoom.roomId,
          },
          userId: {
            eq: userToRoom.userId,
          },
        },
        with: UserToRoomInMessageRelations,
      });
      if (!userToRoomWithRelations)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.UserToRoom, JSON.stringify(userToRoom)).message,
        });

      const { roomId, roomInMessage, user } = userToRoomWithRelations;
      roomEventEmitter.emit("joinRoom", { roomId, sessionId: ctx.getSessionPayload.session.id, user });

      try {
        const messageClient = await useTableClient(AzureTable.Messages);
        const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
        const systemMessage = await createMessage(messageClient, messageAscendingClient, {
          message: `${user.name} joined the room.`,
          roomId,
          type: MessageType.System,
          userId: user.id,
        });
        messageEventEmitter.emit("createMessage", [
          [systemMessage],
          { isSendToSelf: true, sessionId: ctx.getSessionPayload.session.id },
        ]);
      } catch {}

      return roomInMessage;
    }),
  ),
  leaveRoom: standardAuthedProcedure
    .input(leaveRoomInputSchema)
    .use(isRoom)
    .mutation<RoomInMessage["id"]>(async ({ ctx, input }) => {
      const userId = ctx.getSessionPayload.user.id;
      const isCreator = await ctx.db.query.roomsInMessage.findFirst({
        columns: { id: true },
        where: { id: { eq: input }, userId: { eq: userId } },
      });

      if (isCreator) {
        const { id } = await deleteRoom(ctx.db, ctx.getSessionPayload, input);
        return id;
      }

      const userToRoom = (
        await ctx.db
          .delete(usersToRoomsInMessage)
          .where(and(eq(usersToRoomsInMessage.roomId, input), eq(usersToRoomsInMessage.userId, userId)))
          .returning()
      )[0];
      if (!userToRoom)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.UserToRoom, input).message,
        });

      roomEventEmitter.emit("leaveRoom", { ...userToRoom, sessionId: ctx.getSessionPayload.session.id });

      const leavingMember = await ctx.db.query.users.findFirst({
        columns: { name: true },
        where: { id: { eq: userId } },
      });
      if (leavingMember)
        try {
          const messageClient = await useTableClient(AzureTable.Messages);
          const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
          const systemMessage = await createMessage(messageClient, messageAscendingClient, {
            message: `${leavingMember.name} left the room.`,
            roomId: userToRoom.roomId,
            type: MessageType.System,
            userId,
          });
          messageEventEmitter.emit("createMessage", [
            [systemMessage],
            { isSendToSelf: true, sessionId: ctx.getSessionPayload.session.id },
          ]);
        } catch {}

      return userToRoom.roomId;
    }),
  onDeleteRoom: standardAuthedProcedure.input(onDeleteRoomInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ roomId, sessionId, userId }] of on(roomEventEmitter, "deleteRoom", { signal })) {
      if (!input.includes(roomId) || getIsSameDevice({ sessionId, userId }, ctx.getSessionPayload)) continue;
      yield roomId;
    }
  }),
  onJoinRoom: standardAuthedProcedure.input(onJoinRoomInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ roomId, sessionId, user }] of on(roomEventEmitter, "joinRoom", { signal })) {
      if (!input.includes(roomId) || getIsSameDevice({ sessionId, userId: user.id }, ctx.getSessionPayload)) continue;
      yield user;
    }
  }),
  onLeaveRoom: standardAuthedProcedure.input(onLeaveRoomInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ roomId, sessionId, userId }] of on(roomEventEmitter, "leaveRoom", { signal })) {
      if (!input.includes(roomId) || getIsSameDevice({ sessionId, userId }, ctx.getSessionPayload)) continue;
      yield userId;
    }
  }),
  onUpdateRoom: standardAuthedProcedure.input(onUpdateRoomInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [data] of on(roomEventEmitter, "updateRoom", { signal })) {
      if (!input.includes(data.id)) continue;
      yield data;
    }
  }),
  readInvite: standardAuthedProcedure.input(readInviteInputSchema).query(async ({ ctx, input }) => {
    const invite = await ctx.db.query.invitesInMessage.findFirst({
      where: { code: { eq: input } },
      with: InviteInMessageRelations,
    });
    if (!invite) return null;

    const isMember = await ctx.db.query.usersToRoomsInMessage.findFirst({
      where: {
        roomId: {
          eq: invite.roomId,
        },
        userId: {
          eq: ctx.getSessionPayload.user.id,
        },
      },
    });
    return { ...invite, isMember: Boolean(isMember) };
  }),
  readInviteCode: getMemberProcedure(readInviteCodeInputSchema, "roomId")
    .use(isRoom)
    .query<null | string>(({ ctx, input: { roomId } }) =>
      readInviteCode(ctx.db, ctx.getSessionPayload.user.id, roomId),
    ),
  readMembers: getMemberProcedure(readMembersInputSchema, "roomId").query<CursorPaginationData<User>>(
    async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const wheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.roomId, roomId)];
      if (cursor) wheres.push(getCursorWhere(users, cursor, sortBy));
      if (filter?.name) wheres.push(ilike(users.name, `%${filter.name}%`));

      const readUsers = await ctx.db
        .select(getColumns(users))
        .from(users)
        .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, users.id))
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(users, sortBy))
        .limit(limit + 1);
      return getCursorPaginationData(readUsers, limit, sortBy);
    },
  ),
  readMembersByIds: getMemberProcedure(readMembersByIdsInputSchema, "roomId").query(({ ctx, input: { ids, roomId } }) =>
    ctx.db
      .select(getColumns(users))
      .from(users)
      .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, users.id))
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), inArray(users.id, ids))),
  ),
  readMutualRooms: standardAuthedProcedure
    .input(readMutualRoomsInputSchema)
    .query<RoomInMessage[]>(({ ctx, input }) => {
      const usersToRoomsInMessage1 = alias(usersToRoomsInMessage, "usersToRoomsInMessage1");
      const usersToRoomsInMessage2 = alias(usersToRoomsInMessage, "usersToRoomsInMessage2");
      return ctx.db
        .select(getColumns(roomsInMessage))
        .from(roomsInMessage)
        .innerJoin(
          usersToRoomsInMessage1,
          and(
            eq(usersToRoomsInMessage1.roomId, roomsInMessage.id),
            eq(usersToRoomsInMessage1.userId, ctx.getSessionPayload.user.id),
          ),
        )
        .innerJoin(
          usersToRoomsInMessage2,
          and(eq(usersToRoomsInMessage2.roomId, roomsInMessage.id), eq(usersToRoomsInMessage2.userId, input.userId)),
        )
        .where(eq(roomsInMessage.type, RoomType.Room))
        .orderBy(desc(roomsInMessage.updatedAt))
        .limit(MAX_READ_LIMIT);
    }),
  readRoom: standardAuthedProcedure.input(readRoomInputSchema).query<null | RoomInMessage>(async ({ ctx, input }) => {
    if (input) {
      const room = await ctx.db.query.roomsInMessage.findFirst({
        where: {
          RAW: (roomsInMessage, { and, eq, exists }) => {
            const where = and(
              eq(roomsInMessage.id, input),
              exists(
                // Select a constant '1' - we only care if *any* row matches
                ctx.db
                  .select({ _: sql`1` })
                  .from(usersToRoomsInMessage)
                  .where(
                    and(
                      // Condition 1 (Correlation): Link subquery room ID to the outer query room ID
                      eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
                      // Condition 2: Ensure the row belongs to the specific user
                      eq(usersToRoomsInMessage.userId, ctx.getSessionPayload.user.id),
                    ),
                  ),
              ),
            );
            if (!where) throw new InvalidOperationError(Operation.Read, DatabaseEntityType.Room, input);
            return where;
          },
        },
      });
      if (!room)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Room, input).message,
        });
      return room;
    }
    const readRoom = (
      await ctx.db
        .select(getColumns(roomsInMessage))
        .from(roomsInMessage)
        .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
        .where(
          and(eq(usersToRoomsInMessage.userId, ctx.getSessionPayload.user.id), eq(roomsInMessage.type, RoomType.Room)),
        )
        .orderBy(desc(roomsInMessage.updatedAt))
        .limit(1)
    )[0];
    return readRoom ?? null;
  }),
  readRooms: getMemberProcedure(readRoomsInputSchema, "roomId").query(
    async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const innerJoinCondition = and(
        eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
        eq(usersToRoomsInMessage.userId, ctx.getSessionPayload.user.id),
      );
      let room: RoomInMessage | undefined;

      if (roomId) {
        room = (
          await ctx.db
            .select(getColumns(roomsInMessage))
            .from(roomsInMessage)
            .innerJoin(usersToRoomsInMessage, innerJoinCondition)
            .where(and(eq(roomsInMessage.id, roomId), eq(roomsInMessage.type, RoomType.Room)))
        )[0];
        if (!room)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new NotFoundError(DatabaseEntityType.Room, roomId).message,
          });
      }

      const wheres: (SQL | undefined)[] = [eq(roomsInMessage.type, RoomType.Room)];
      if (cursor) wheres.push(getCursorWhere(roomsInMessage, cursor, sortBy));
      if (filter?.name) wheres.push(ilike(roomsInMessage.name, `%${filter.name}%`));
      if (room) wheres.push(ne(roomsInMessage.id, room.id));

      const readRooms = await ctx.db
        .select(getColumns(roomsInMessage))
        .from(roomsInMessage)
        .innerJoin(usersToRoomsInMessage, innerJoinCondition)
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(roomsInMessage, sortBy))
        .limit(limit + 1);
      const cursorPaginationData = getCursorPaginationData(readRooms, limit, sortBy);
      if (room) cursorPaginationData.items.push(room);
      return cursorPaginationData;
    },
  ),
  updateRoom: addProfanityFilterMiddleware(
    getPermissionsProcedure(RoomPermission.ManageRoom, updateRoomInputSchema, "id"),
    ["name"],
  ).mutation<RoomInMessage>(async ({ ctx, input: { id, ...rest } }) => {
    const name = normalizeString(rest.name) || undefined;
    const updatedRoom = (
      await ctx.db
        .update(roomsInMessage)
        .set({ ...rest, name })
        .where(eq(roomsInMessage.id, id))
        .returning()
    )[0];
    if (!updatedRoom)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Room, id).message,
      });

    roomEventEmitter.emit("updateRoom", updatedRoom);
    return updatedRoom;
  }),
});
