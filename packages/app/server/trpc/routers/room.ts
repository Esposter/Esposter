import type { Room } from "#shared/db/schema/rooms";
import type { UserToRoom } from "#shared/db/schema/usersToRooms";

import { InviteRelations, invites, selectInviteSchema } from "#shared/db/schema/invites";
import { rooms, selectRoomSchema } from "#shared/db/schema/rooms";
import { sessions } from "#shared/db/schema/sessions";
import { selectUserSchema, users } from "#shared/db/schema/users";
import { userStatuses } from "#shared/db/schema/userStatuses";
import { usersToRooms, UserToRoomRelations } from "#shared/db/schema/usersToRooms";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { createRoomInputSchema } from "#shared/models/db/room/CreateRoomInput";
import { deleteRoomInputSchema } from "#shared/models/db/room/DeleteRoomInput";
import { joinRoomInputSchema } from "#shared/models/db/room/JoinRoomInput";
import { leaveRoomInputSchema } from "#shared/models/db/room/LeaveRoomInput";
import { updateRoomInputSchema } from "#shared/models/db/room/UpdateRoomInput";
import { UserStatus } from "#shared/models/db/UserStatus";
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { dayjs } from "#shared/services/dayjs";
import { CODE_LENGTH } from "#shared/services/invite/constants";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { createCode } from "#shared/util/math/random/createCode";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { deleteDirectory } from "@@/server/services/azure/container/deleteDirectory";
import { deleteRoom } from "@@/server/services/db/room/deleteRoom";
import { roomEventEmitter } from "@@/server/services/esbabbler/events/roomEventEmitter";
import { readInviteCode } from "@@/server/services/esbabbler/readInviteCode";
import { on } from "@@/server/services/events/on";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { getProfanityFilterProcedure } from "@@/server/trpc/procedure/getProfanityFilterProcedure";
import { getCreatorProcedure } from "@@/server/trpc/procedure/room/getCreatorProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { z } from "zod/v4";

const readRoomInputSchema = selectRoomSchema.shape.id.optional();
export type ReadRoomInput = z.infer<typeof readRoomInputSchema>;

const readRoomsInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(selectRoomSchema.keyof(), [{ key: "updatedAt", order: SortOrder.Desc }])
      .shape,
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
  ...createCursorPaginationParamsSchema(selectUserSchema.keyof(), [{ key: "updatedAt", order: SortOrder.Desc }]).shape,
  filter: selectUserSchema.pick({ name: true }).optional(),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;

const readMembersByIdsInputSchema = z.object({
  ids: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMembersByIdsInput = z.infer<typeof readMembersByIdsInputSchema>;

const readStatusesInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userIds: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});
export type ReadStatusesInput = z.infer<typeof readStatusesInputSchema>;

const createMembersInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userIds: selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});
export type CreateMembersInput = z.infer<typeof createMembersInputSchema>;

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
  deleteRoom: authedProcedure.input(deleteRoomInputSchema).mutation<Room>(async ({ ctx, input }) => {
    const deletedRoom = await deleteRoom(ctx.db, ctx.session, input);
    const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
    await deleteDirectory(containerClient, input, true);
    return deletedRoom;
  }),
  joinRoom: authedProcedure.input(joinRoomInputSchema).mutation<Room>(async ({ ctx, input }) => {
    const invite = await ctx.db.query.invites.findFirst({ where: (invites, { eq }) => eq(invites.code, input) });
    if (!invite)
      throw new TRPCError({ code: "NOT_FOUND", message: new NotFoundError(DatabaseEntityType.Invite, input).message });

    const userToRoom = (
      await ctx.db.insert(usersToRooms).values({ roomId: invite.roomId, userId: ctx.session.user.id }).returning()
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

    const userToRoomWithRelations = await ctx.db.query.usersToRooms.findFirst({
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
          message: new InvalidOperationError(
            Operation.Delete,
            DatabaseEntityType.UserToRoom,
            JSON.stringify({ roomId: input }),
          ).message,
        });

      roomEventEmitter.emit("leaveRoom", { ...userToRoom, sessionId: ctx.session.session.id });
      return userToRoom.roomId;
    }
  }),
  onDeleteRoom: authedProcedure.input(onDeleteRoomInputSchema).subscription(async function* ({ input, signal }) {
    for await (const [roomId] of on(roomEventEmitter, "deleteRoom", { signal })) {
      if (!input.includes(roomId)) continue;
      yield roomId;
    }
  }),
  onJoinRoom: authedProcedure.input(onJoinRoomInputSchema).subscription(async function* ({ ctx, input, signal }) {
    for await (const [data] of on(roomEventEmitter, "joinRoom", { signal })) {
      if (
        !input.includes(data.roomId) ||
        getIsSameDevice({ sessionId: data.sessionId, userId: data.user.id }, ctx.session)
      )
        continue;
      const isMember = await ctx.db.query.usersToRooms.findFirst({
        where: (usersToRooms, { and, eq }) =>
          and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, data.roomId)),
      });
      if (!isMember) continue;
      yield data;
    }
  }),
  onLeaveRoom: authedProcedure.input(onLeaveRoomInputSchema).subscription(async function* ({ ctx, input, signal }) {
    for await (const [data] of on(roomEventEmitter, "leaveRoom", { signal })) {
      if (!input.includes(data.roomId) || getIsSameDevice(data, ctx.session)) continue;
      const isMember = await ctx.db.query.usersToRooms.findFirst({
        where: (usersToRooms, { and, eq }) =>
          and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, data.roomId)),
      });
      if (!isMember) continue;
      yield data;
    }
  }),
  onUpdateRoom: authedProcedure.input(onUpdateRoomInputSchema).subscription(async function* ({ ctx, input, signal }) {
    for await (const [data] of on(roomEventEmitter, "updateRoom", { signal })) {
      if (!input.includes(data.id)) continue;
      const isMember = await ctx.db.query.usersToRooms.findFirst({
        where: (usersToRooms, { and, eq }) =>
          and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, data.id)),
      });
      if (!isMember) continue;
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
        and(eq(usersToRooms.userId, invite.userId), eq(usersToRooms.roomId, invite.roomId)),
    });
    return { ...invite, isMember: Boolean(isMember) };
  }),
  readInviteCode: getMemberProcedure(readInviteCodeInputSchema, "roomId").query<null | string>(
    async ({ ctx, input: { roomId } }) => readInviteCode(ctx.db, ctx.session.user.id, roomId),
  ),
  readMembers: getMemberProcedure(readMembersInputSchema, "roomId").query(
    async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const filterWhere = filter?.name ? ilike(users.name, `%${filter.name}%`) : undefined;
      const cursorWhere = cursor ? getCursorWhere(users, cursor, sortBy) : undefined;
      const joinedUsers = await ctx.db
        .select()
        .from(users)
        .innerJoin(usersToRooms, and(eq(usersToRooms.userId, users.id)))
        .where(and(eq(usersToRooms.roomId, roomId), filterWhere, cursorWhere))
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
        .innerJoin(usersToRooms, and(eq(usersToRooms.userId, users.id)))
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
  readRooms: authedProcedure
    .input(readRoomsInputSchema)
    .query(async ({ ctx, input: { cursor, filter, limit, sortBy } }) => {
      const filterWhere = filter?.name ? ilike(rooms.name, `%${filter.name}%`) : undefined;
      const cursorWhere = cursor ? getCursorWhere(rooms, cursor, sortBy) : undefined;
      const joinedRooms = await ctx.db
        .select()
        .from(rooms)
        .innerJoin(usersToRooms, and(eq(usersToRooms.roomId, rooms.id), eq(usersToRooms.userId, ctx.session.user.id)))
        .where(and(filterWhere, cursorWhere))
        .orderBy(...parseSortByToSql(rooms, sortBy))
        .limit(limit + 1);
      const resultRooms = joinedRooms.map(({ rooms }) => rooms);
      return getCursorPaginationData(resultRooms, limit, sortBy);
    }),
  readStatuses: getMemberProcedure(readStatusesInputSchema, "roomId").query(
    async ({ ctx, input: { roomId, userIds } }) => {
      const foundUsersToRooms = await ctx.db.query.usersToRooms.findMany({
        where: (usersToRooms, { and, eq, inArray }) =>
          and(inArray(usersToRooms.userId, userIds), eq(usersToRooms.roomId, roomId)),
      });
      if (foundUsersToRooms.length !== userIds.length) throw new TRPCError({ code: "UNAUTHORIZED" });

      const cutoffDate = new Date();
      const joinedUserStatuses = await ctx.db
        .select()
        .from(userStatuses)
        .leftJoin(sessions, eq(sessions.userId, userStatuses.userId))
        .where(inArray(userStatuses.userId, userIds));
      return joinedUserStatuses.map(({ sessions, user_statuses }) => {
        if (!sessions) return UserStatus.Offline;

        const getAutoDetectedStatus = () =>
          dayjs(sessions.expiresAt).isBefore(cutoffDate) ? UserStatus.Offline : UserStatus.Online;
        if (user_statuses.status)
          return user_statuses.expiresAt && dayjs(user_statuses.expiresAt).isBefore(cutoffDate)
            ? getAutoDetectedStatus()
            : user_statuses.status;
        else return getAutoDetectedStatus();
      });
    },
  ),
  updateRoom: getProfanityFilterProcedure(updateRoomInputSchema, ["name"]).mutation<Room>(
    async ({ ctx, input: { id, ...rest } }) => {
      const updatedRoom = (
        await ctx.db
          .update(rooms)
          .set(rest)
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
