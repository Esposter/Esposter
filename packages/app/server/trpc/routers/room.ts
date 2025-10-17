import type { Room, UserToRoom } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { createRoomInputSchema } from "#shared/models/db/room/CreateRoomInput";
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
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { getProfanityFilterProcedure } from "@@/server/trpc/procedure/getProfanityFilterProcedure";
import { getCreatorProcedure } from "@@/server/trpc/procedure/room/getCreatorProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { deleteDirectory } from "@esposter/db";
import {
  AzureContainer,
  CODE_LENGTH,
  DatabaseEntityType,
  InviteRelations,
  invites,
  rooms,
  selectInviteSchema,
  selectRoomSchema,
  selectUserSchema,
  users,
  usersToRooms,
  UserToRoomRelations,
} from "@esposter/db-schema";
import { InvalidOperationError, ItemMetadataPropertyNames, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, inArray, ne, sql } from "drizzle-orm";
import { z } from "zod";

const readRoomInputSchema = selectRoomSchema.shape.id.optional();
export type ReadRoomInput = z.infer<typeof readRoomInputSchema>;

const readRoomsInputSchema = z
  .object({
    roomId: selectRoomSchema.shape.id.optional(),
    ...createCursorPaginationParamsSchema(selectRoomSchema.keyof(), [
      { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
    ]).shape,
    filter: selectRoomSchema.pick({ name: true }).optional(),
  })
  .prefault({});
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;

const onUpdateRoomInputSchema = selectRoomSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnUpdateRoomInput = z.infer<typeof onUpdateRoomInputSchema>;

const onDeleteRoomInputSchema = selectRoomSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnDeleteRoomInput = z.infer<typeof onDeleteRoomInputSchema>;

const onJoinRoomInputSchema = selectRoomSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnJoinRoomInput = z.infer<typeof onJoinRoomInputSchema>;

const onLeaveRoomInputSchema = selectRoomSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnLeaveRoomInput = z.infer<typeof onLeaveRoomInputSchema>;

const readMembersInputSchema = z.object({
  ...createCursorPaginationParamsSchema(selectUserSchema.keyof(), [
    { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
  ]).shape,
  filter: selectUserSchema.pick({ name: true }).optional(),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;

const readMembersByIdsInputSchema = z.object({
  ids: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMembersByIdsInput = z.infer<typeof readMembersByIdsInputSchema>;

const createMembersInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userIds: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});
export type CreateMembersInput = z.infer<typeof createMembersInputSchema>;

const deleteMemberInputSchema = z.object({ roomId: selectRoomSchema.shape.id, userId: selectUserSchema.shape.id });
export type DeleteMemberInput = z.infer<typeof deleteMemberInputSchema>;

const readInviteInputSchema = selectInviteSchema.shape.code;
export type ReadInviteInput = z.infer<typeof readInviteInputSchema>;

const readInviteCodeInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type ReadInviteCodeInput = z.infer<typeof readInviteCodeInputSchema>;

const createInviteInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type CreateInviteInput = z.infer<typeof createInviteInputSchema>;
// For room-related queries/mutations we don't need to grab the room user procedure
// as the SQL clauses inherently contain logic to filter if the user is a member/creator of the room
export const roomRouter = router({
  createInvite: getMemberProcedure(createInviteInputSchema, "roomId").mutation<string>(
    async ({ ctx, input: { roomId } }) => {
      let inviteCode = await readInviteCode(ctx.db, ctx.session.user.id, roomId, true);
      if (inviteCode) return inviteCode;

      for (let i = 0; i < 3; i++)
        try {
          // Create non-colliding invite code
          inviteCode = createCode(CODE_LENGTH);
          await ctx.db.insert(invites).values({ code: inviteCode, roomId, userId: ctx.session.user.id });
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
  createMembers: getCreatorProcedure(createMembersInputSchema, "roomId").mutation<UserToRoom[]>(
    ({ ctx, input: { roomId, userIds } }) =>
      ctx.db.transaction(async (tx) => {
        const newMembers: UserToRoom[] = [];
        for (const userId of userIds) {
          const newMember = (await tx.insert(usersToRooms).values({ roomId, userId }).returning()).find(Boolean);
          if (!newMember) continue;
          newMembers.push(newMember);
        }
        return newMembers;
      }),
  ),
  createRoom: getProfanityFilterProcedure(createRoomInputSchema, ["name"]).mutation<Room>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const newRoom = (
        await tx
          .insert(rooms)
          .values({ ...input, userId: ctx.session.user.id })
          .returning()
      ).find(Boolean);
      if (!newRoom)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Room, JSON.stringify(input)).message,
        });

      await tx.insert(usersToRooms).values({ roomId: newRoom.id, userId: ctx.session.user.id });
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
          .delete(usersToRooms)
          .where(and(eq(usersToRooms.roomId, roomId), eq(usersToRooms.userId, userId)))
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
  deleteRoom: authedProcedure.input(deleteRoomInputSchema).mutation<Room>(async ({ ctx, input }) => {
    const deletedRoom = await deleteRoom(ctx.db, ctx.session, input);
    const containerClient = await useContainerClient(AzureContainer.MessageAssets);
    await deleteDirectory(containerClient, input, true);
    return deletedRoom;
  }),
  joinRoom: authedProcedure.input(joinRoomInputSchema).mutation<Room>(({ ctx, input }) =>
    ctx.db.transaction(async (tx) => {
      const invite = await tx.query.invites.findFirst({
        columns: {
          roomId: true,
        },
        where: (invites, { eq }) => eq(invites.code, input),
      });
      if (!invite)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Invite, input).message,
        });

      const userToRoom = (
        await tx.insert(usersToRooms).values({ roomId: invite.roomId, userId: ctx.session.user.id }).returning()
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

      const userToRoomWithRelations = await tx.query.usersToRooms.findFirst({
        where: (usersToRooms, { and, eq }) =>
          and(eq(usersToRooms.userId, userToRoom.userId), eq(usersToRooms.roomId, userToRoom.roomId)),
        with: UserToRoomRelations,
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
  leaveRoom: authedProcedure.input(leaveRoomInputSchema).mutation<Room["id"]>(async ({ ctx, input }) => {
    try {
      const { id } = await deleteRoom(ctx.db, ctx.session, input);
      return id;
    } catch {
      const userToRoom = (
        await ctx.db
          .delete(usersToRooms)
          .where(and(eq(usersToRooms.roomId, input), eq(usersToRooms.userId, ctx.session.user.id)))
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
  onDeleteRoom: authedProcedure.input(onDeleteRoomInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await isMember(ctx.db, ctx.session, input);

    for await (const [{ roomId, sessionId, userId }] of on(roomEventEmitter, "deleteRoom", { signal })) {
      if (!input.includes(roomId) || getIsSameDevice({ sessionId, userId }, ctx.session)) continue;
      yield roomId;
    }
  }),
  onJoinRoom: authedProcedure.input(onJoinRoomInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await isMember(ctx.db, ctx.session, input);

    for await (const [data] of on(roomEventEmitter, "joinRoom", { signal })) {
      if (
        !input.includes(data.roomId) ||
        getIsSameDevice({ sessionId: data.sessionId, userId: data.user.id }, ctx.session)
      )
        continue;
      yield data;
    }
  }),
  onLeaveRoom: authedProcedure.input(onLeaveRoomInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await isMember(ctx.db, ctx.session, input);

    for await (const [data] of on(roomEventEmitter, "leaveRoom", { signal })) {
      if (!input.includes(data.roomId) || getIsSameDevice(data, ctx.session)) continue;
      yield data;
    }
  }),
  onUpdateRoom: authedProcedure.input(onUpdateRoomInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await isMember(ctx.db, ctx.session, input);

    for await (const [data] of on(roomEventEmitter, "updateRoom", { signal })) {
      if (!input.includes(data.id)) continue;
      yield data;
    }
  }),
  readInvite: authedProcedure.input(readInviteInputSchema).query(async ({ ctx, input }) => {
    const invite = await ctx.db.query.invites.findFirst({
      where: (invites, { eq }) => eq(invites.code, input),
      with: InviteRelations,
    });
    if (!invite) return null;

    const isMember = await ctx.db.query.usersToRooms.findFirst({
      where: (usersToRooms, { and, eq }) =>
        and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, invite.roomId)),
    });
    return { ...invite, isMember: Boolean(isMember) };
  }),
  readInviteCode: getMemberProcedure(readInviteCodeInputSchema, "roomId").query<null | string>(
    ({ ctx, input: { roomId } }) => readInviteCode(ctx.db, ctx.session.user.id, roomId),
  ),
  readMembers: getMemberProcedure(readMembersInputSchema, "roomId").query(
    async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const wheres: (SQL | undefined)[] = [eq(usersToRooms.roomId, roomId)];
      if (cursor) wheres.push(getCursorWhere(users, cursor, sortBy));
      if (filter?.name) wheres.push(ilike(users.name, `%${filter.name}%`));
      const joinedUsers = await ctx.db
        .select()
        .from(users)
        .innerJoin(usersToRooms, eq(usersToRooms.userId, users.id))
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(users, sortBy))
        .limit(limit + 1);
      const resultUsers = joinedUsers.map(({ users }) => users);
      return getCursorPaginationData(resultUsers, limit, sortBy);
    },
  ),
  readMembersByIds: getMemberProcedure(readMembersByIdsInputSchema, "roomId").query(
    async ({ ctx, input: { ids, roomId } }) => {
      const joinedUsers = await ctx.db
        .select()
        .from(users)
        .innerJoin(usersToRooms, eq(usersToRooms.userId, users.id))
        .where(and(eq(usersToRooms.roomId, roomId), inArray(users.id, ids)));
      return joinedUsers.map(({ users }) => users);
    },
  ),
  readRoom: authedProcedure.input(readRoomInputSchema).query<null | Room>(async ({ ctx, input }) => {
    if (input) {
      const room = await ctx.db.query.rooms.findFirst({
        where: (rooms, { and, eq, exists }) =>
          and(
            eq(rooms.id, input),
            exists(
              // Select a constant '1' - we only care if *any* row matches
              ctx.db
                .select({ _: sql`1` })
                .from(usersToRooms)
                .where(
                  and(
                    // Condition 1 (Correlation): Link subquery room ID to the outer query room ID
                    eq(usersToRooms.roomId, rooms.id),
                    // Condition 2: Ensure the row belongs to the specific user
                    eq(usersToRooms.userId, ctx.session.user.id),
                  ),
                ),
            ),
          ),
      });
      if (!room)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Room, input).message,
        });
      return room;
    }
    // By default, we will return the latest updated room
    const joinedRoom = (
      await ctx.db
        .select()
        .from(rooms)
        .innerJoin(usersToRooms, eq(usersToRooms.roomId, rooms.id))
        .where(eq(usersToRooms.userId, ctx.session.user.id))
        .orderBy(desc(rooms.updatedAt))
        .limit(1)
    ).find(Boolean);
    return joinedRoom?.rooms ?? null;
  }),
  readRooms: getMemberProcedure(readRoomsInputSchema, "roomId").query(
    async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const innerJoinCondition = and(eq(usersToRooms.roomId, rooms.id), eq(usersToRooms.userId, ctx.session.user.id));
      let pinnedRoom: Room | undefined;

      if (roomId) {
        pinnedRoom = (
          await ctx.db.select().from(rooms).innerJoin(usersToRooms, innerJoinCondition).where(eq(rooms.id, roomId))
        ).find(Boolean)?.rooms;
        if (!pinnedRoom)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new NotFoundError(DatabaseEntityType.Room, roomId).message,
          });
      }

      const wheres: (SQL | undefined)[] = [];
      if (cursor) wheres.push(getCursorWhere(rooms, cursor, sortBy));
      if (filter?.name) wheres.push(ilike(rooms.name, `%${filter.name}%`));
      if (pinnedRoom) wheres.push(ne(rooms.id, pinnedRoom.id));

      const joinedRooms = await ctx.db
        .select()
        .from(rooms)
        .innerJoin(usersToRooms, innerJoinCondition)
        .where(and(...wheres))
        .orderBy(...parseSortByToSql(rooms, sortBy))
        .limit(limit + 1);
      const resultRooms = joinedRooms.map(({ rooms }) => rooms);
      const cursorPaginationData = getCursorPaginationData(resultRooms, limit, sortBy);
      if (pinnedRoom) cursorPaginationData.items.push(pinnedRoom);
      return cursorPaginationData;
    },
  ),
  updateRoom: getProfanityFilterProcedure(updateRoomInputSchema, ["name"]).mutation<Room>(
    async ({ ctx, input: { id, ...rest } }) => {
      const name = rest.name?.trim();
      const updatedRoom = (
        await ctx.db
          .update(rooms)
          .set({ ...rest, name })
          .where(and(eq(rooms.id, id), eq(rooms.userId, ctx.session.user.id)))
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
