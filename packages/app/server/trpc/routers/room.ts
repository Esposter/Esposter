import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";
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
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { on } from "@@/server/services/events/on";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { readInviteCode } from "@@/server/services/message/readInviteCode";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { deleteRoom } from "@@/server/services/room/deleteRoom";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getProfanityFilterProcedure } from "@@/server/trpc/procedure/getProfanityFilterProcedure";
import { getCreatorProcedure } from "@@/server/trpc/procedure/room/getCreatorProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { deleteDirectory } from "@esposter/db";
import {
  AzureContainer,
  CODE_LENGTH,
  DatabaseEntityType,
  InviteInMessageRelations,
  invitesInMessage,
  roomsInMessage,
  selectInviteInMessageSchema,
  selectRoomInMessageSchema,
  selectUserSchema,
  users,
  usersToRoomsInMessage,
  UserToRoomInMessageRelations,
} from "@esposter/db-schema";
import { InvalidOperationError, ItemMetadataPropertyNames, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike, inArray, ne, sql } from "drizzle-orm";
import { z } from "zod";

const readRoomInputSchema = selectRoomInMessageSchema.shape.id.optional();
export type ReadRoomInput = z.infer<typeof readRoomInputSchema>;

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
  ...createCursorPaginationParamsSchema(selectUserSchema.keyof(), [
    { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
  ]).shape,
  filter: selectUserSchema.pick({ name: true }).optional(),
  roomId: selectRoomInMessageSchema.shape.id,
});
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;

const readMembersByIdsInputSchema = z.object({
  ids: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomInMessageSchema.shape.id,
});
export type ReadMembersByIdsInput = z.infer<typeof readMembersByIdsInputSchema>;

const countMembersInputSchema = z.object({ roomId: selectRoomInMessageSchema.shape.id });
export type CountMembersInput = z.infer<typeof countMembersInputSchema>;

const createMembersInputSchema = z.object({
  roomId: selectRoomInMessageSchema.shape.id,
  userIds: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});
export type CreateMembersInput = z.infer<typeof createMembersInputSchema>;

const readInviteInputSchema = selectInviteInMessageSchema.shape.code;
export type ReadInviteInput = z.infer<typeof readInviteInputSchema>;

const readInviteCodeInputSchema = z.object({ roomId: selectRoomInMessageSchema.shape.id });
export type ReadInviteCodeInput = z.infer<typeof readInviteCodeInputSchema>;

const createInviteInputSchema = z.object({ roomId: selectRoomInMessageSchema.shape.id });
export type CreateInviteInput = z.infer<typeof createInviteInputSchema>;
// For room-related queries/mutations we don't need to grab the room user procedure
// As the SQL clauses inherently contain logic to filter if the user is a member/creator of the room
export const roomRouter = router({
  countMembers: getMemberProcedure(countMembersInputSchema, "roomId").query(
    async ({ ctx, input: { roomId } }) =>
      (
        await ctx.db
          .select({ count: count() })
          .from(usersToRoomsInMessage)
          .where(eq(usersToRoomsInMessage.roomId, roomId))
      )[0].count,
  ),
  createInvite: getMemberProcedure(createInviteInputSchema, "roomId").mutation<string>(
    async ({ ctx, input: { roomId } }) => {
      let inviteCode = await readInviteCode(ctx.db, ctx.session.user.id, roomId, true);
      if (inviteCode) return inviteCode;

      for (let i = 0; i < 3; i++)
        try {
          // Create non-colliding invite code
          inviteCode = createCode(CODE_LENGTH);
          await ctx.db.insert(invitesInMessage).values({ code: inviteCode, roomId, userId: ctx.session.user.id });
          return inviteCode;
        } catch {
          continue;
        }
      // If we reach here, it means that we've failed to create a non-colliding invite code and something has gone horribly wrong
      throw new TRPCError({
        code: "UNPROCESSABLE_CONTENT",
        message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Invite, roomId).message,
      });
    },
  ),
  createMembers: getCreatorProcedure(createMembersInputSchema, "roomId").mutation<UserToRoomInMessage[]>(
    ({ ctx, input: { roomId, userIds } }) =>
      ctx.db.transaction(async (tx) => {
        const newMembers: UserToRoomInMessage[] = [];
        for (const userId of userIds) {
          const newMember = (await tx.insert(usersToRoomsInMessage).values({ roomId, userId }).returning()).find(
            Boolean,
          );
          if (!newMember) continue;
          newMembers.push(newMember);
        }
        return newMembers;
      }),
  ),
  createRoom: getProfanityFilterProcedure(createRoomInputSchema, ["name"]).mutation<RoomInMessage>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const newRoom = (
        await tx
          .insert(roomsInMessage)
          .values({ ...input, userId: ctx.session.user.id })
          .returning()
      ).find(Boolean);
      if (!newRoom)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Room, JSON.stringify(input)).message,
        });

      await tx.insert(usersToRoomsInMessage).values({ roomId: newRoom.id, userId: ctx.session.user.id });
      return newRoom;
    }),
  ),
  deleteMember: getCreatorProcedure(deleteMemberInputSchema, "roomId").mutation(
    async ({ ctx, input: { roomId, userId } }) => {
      if (userId === ctx.session.user.id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Delete,
            DatabaseEntityType.UserToRoom,
            JSON.stringify({ roomId, userId }),
          ).message,
        });

      const deletedMember = (
        await ctx.db
          .delete(usersToRoomsInMessage)
          .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)))
          .returning()
      ).find(Boolean);
      if (!deletedMember)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Delete,
            DatabaseEntityType.UserToRoom,
            JSON.stringify({ roomId, userId }),
          ).message,
        });

      roomEventEmitter.emit("leaveRoom", { ...deletedMember, sessionId: ctx.session.session.id });
    },
  ),
  deleteRoom: standardAuthedProcedure.input(deleteRoomInputSchema).mutation<RoomInMessage>(async ({ ctx, input }) => {
    const deletedRoom = await deleteRoom(ctx.db, ctx.session, input);
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

      const userToRoom = (
        await tx
          .insert(usersToRoomsInMessage)
          .values({ roomId: invite.roomId, userId: ctx.session.user.id })
          .returning()
      ).find(Boolean);
      if (!userToRoom)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Create,
            DatabaseEntityType.UserToRoom,
            JSON.stringify({ roomId: invite.roomId, userId: ctx.session.user.id }),
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

      const { room, roomId, user } = userToRoomWithRelations;
      roomEventEmitter.emit("joinRoom", { roomId, sessionId: ctx.session.session.id, user });
      return room;
    }),
  ),
  leaveRoom: standardAuthedProcedure
    .input(leaveRoomInputSchema)
    .mutation<RoomInMessage["id"]>(async ({ ctx, input }) => {
      try {
        const { id } = await deleteRoom(ctx.db, ctx.session, input);
        return id;
      } catch {
        const userToRoom = (
          await ctx.db
            .delete(usersToRoomsInMessage)
            .where(and(eq(usersToRoomsInMessage.roomId, input), eq(usersToRoomsInMessage.userId, ctx.session.user.id)))
            .returning()
        ).find(Boolean);
        if (!userToRoom)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.UserToRoom, input).message,
          });

        roomEventEmitter.emit("leaveRoom", { ...userToRoom, sessionId: ctx.session.session.id });
        return userToRoom.roomId;
      }
    }),
  onDeleteRoom: standardAuthedProcedure.input(onDeleteRoomInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.session, input);

    for await (const [{ roomId, sessionId, userId }] of on(roomEventEmitter, "deleteRoom", { signal })) {
      if (!input.includes(roomId) || getIsSameDevice({ sessionId, userId }, ctx.session)) continue;
      yield roomId;
    }
  }),
  onJoinRoom: standardAuthedProcedure.input(onJoinRoomInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.session, input);

    for await (const [{ roomId, sessionId, user }] of on(roomEventEmitter, "joinRoom", { signal })) {
      if (!input.includes(roomId) || getIsSameDevice({ sessionId, userId: user.id }, ctx.session)) continue;
      yield user;
    }
  }),
  onLeaveRoom: standardAuthedProcedure.input(onLeaveRoomInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.session, input);

    for await (const [{ roomId, sessionId, userId }] of on(roomEventEmitter, "leaveRoom", { signal })) {
      if (!input.includes(roomId) || getIsSameDevice({ sessionId, userId }, ctx.session)) continue;
      yield userId;
    }
  }),
  onUpdateRoom: standardAuthedProcedure.input(onUpdateRoomInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.session, input);

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
          eq: ctx.session.user.id,
        },
      },
    });
    return { ...invite, isMember: Boolean(isMember) };
  }),
  readInviteCode: getMemberProcedure(readInviteCodeInputSchema, "roomId").query<null | string>(
    ({ ctx, input: { roomId } }) => readInviteCode(ctx.db, ctx.session.user.id, roomId),
  ),
  readMembers: getMemberProcedure(readMembersInputSchema, "roomId").query(
    async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const wheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.roomId, roomId)];
      if (cursor) wheres.push(getCursorWhere(users, cursor, sortBy));
      if (filter?.name) wheres.push(ilike(users.name, `%${filter.name}%`));

      const readUsers = await ctx.db
        .select({ user: users })
        .from(users)
        .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, users.id))
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(users, sortBy))
        .limit(limit + 1);
      return getCursorPaginationData(
        readUsers.map(({ user }) => user),
        limit,
        sortBy,
      );
    },
  ),
  readMembersByIds: getMemberProcedure(readMembersByIdsInputSchema, "roomId").query(
    async ({ ctx, input: { ids, roomId } }) => {
      const readUsers = await ctx.db
        .select({ user: users })
        .from(users)
        .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, users.id))
        .where(and(eq(usersToRoomsInMessage.roomId, roomId), inArray(users.id, ids)));
      return readUsers.map(({ user }) => user);
    },
  ),
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
                      eq(usersToRoomsInMessage.userId, ctx.session.user.id),
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
    // By default, we will return the latest updated room
    const readRoom = (
      await ctx.db
        .select({ room: roomsInMessage })
        .from(roomsInMessage)
        .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
        .where(eq(usersToRoomsInMessage.userId, ctx.session.user.id))
        .orderBy(desc(roomsInMessage.updatedAt))
        .limit(1)
    ).find(Boolean);
    return readRoom?.room ?? null;
  }),
  readRooms: getMemberProcedure(readRoomsInputSchema, "roomId").query(
    async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const innerJoinCondition = and(
        eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
        eq(usersToRoomsInMessage.userId, ctx.session.user.id),
      );
      let pinnedRoom: RoomInMessage | undefined;

      if (roomId) {
        pinnedRoom = (
          await ctx.db
            .select({ room: roomsInMessage })
            .from(roomsInMessage)
            .innerJoin(usersToRoomsInMessage, innerJoinCondition)
            .where(eq(roomsInMessage.id, roomId))
        ).find(Boolean)?.room;
        if (!pinnedRoom)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new NotFoundError(DatabaseEntityType.Room, roomId).message,
          });
      }

      const wheres: (SQL | undefined)[] = [];
      if (cursor) wheres.push(getCursorWhere(roomsInMessage, cursor, sortBy));
      if (filter?.name) wheres.push(ilike(roomsInMessage.name, `%${filter.name}%`));
      if (pinnedRoom) wheres.push(ne(roomsInMessage.id, pinnedRoom.id));

      const readRooms = await ctx.db
        .select({ rooms: roomsInMessage })
        .from(roomsInMessage)
        .innerJoin(usersToRoomsInMessage, innerJoinCondition)
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(roomsInMessage, sortBy))
        .limit(limit + 1);
      const cursorPaginationData = getCursorPaginationData(
        readRooms.map(({ rooms }) => rooms),
        limit,
        sortBy,
      );
      if (pinnedRoom) cursorPaginationData.items.push(pinnedRoom);
      return cursorPaginationData;
    },
  ),
  updateRoom: getProfanityFilterProcedure(updateRoomInputSchema, ["name"]).mutation<RoomInMessage>(
    async ({ ctx, input: { id, ...rest } }) => {
      const name = rest.name?.trim();
      const updatedRoom = (
        await ctx.db
          .update(roomsInMessage)
          .set({ ...rest, name })
          .where(and(eq(roomsInMessage.id, id), eq(roomsInMessage.userId, ctx.session.user.id)))
          .returning()
      ).find(Boolean);
      if (!updatedRoom)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Room, id).message,
        });

      roomEventEmitter.emit("updateRoom", updatedRoom);
      return updatedRoom;
    },
  ),
});
