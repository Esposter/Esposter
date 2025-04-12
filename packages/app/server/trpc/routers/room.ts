import type { Room } from "#shared/db/schema/rooms";
import type { UserToRoom } from "#shared/db/schema/users";

import { InviteRelations, invites, selectInviteSchema } from "#shared/db/schema/invites";
import { rooms, selectRoomSchema } from "#shared/db/schema/rooms";
import { selectUserSchema, users, usersToRooms } from "#shared/db/schema/users";
import { createRoomInputSchema } from "#shared/models/db/room/CreateRoomInput";
import { deleteRoomInputSchema } from "#shared/models/db/room/DeleteRoomInput";
import { leaveRoomInputSchema } from "#shared/models/db/room/LeaveRoomInput";
import { updateRoomInputSchema } from "#shared/models/db/room/UpdateRoomInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { CODE_LENGTH } from "#shared/services/invite/constants";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { createCode } from "#shared/util/math/random/createCode";
import { readInviteCode } from "@@/server/services/esbabbler/readInviteCode";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { getProfanityFilterProcedure } from "@@/server/trpc/procedure/getProfanityFilterProcedure";
import { getRoomOwnerProcedure } from "@@/server/trpc/procedure/getRoomOwnerProcedure";
import { getRoomUserProcedure } from "@@/server/trpc/procedure/getRoomUserProcedure";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { z } from "zod";

const readRoomInputSchema = selectRoomSchema.shape.id.optional();
export type ReadRoomInput = z.infer<typeof readRoomInputSchema>;

const readRoomsInputSchema = createCursorPaginationParamsSchema(selectRoomSchema.keyof(), [
  { key: "updatedAt", order: SortOrder.Desc },
]).default({});
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;

const joinRoomInputSchema = selectInviteSchema.shape.code;
export type JoinRoomInput = z.infer<typeof joinRoomInputSchema>;

const readMembersInputSchema = z
  .object({
    filter: selectUserSchema.pick({ name: true }).optional(),
    roomId: selectRoomSchema.shape.id,
  })
  .merge(createCursorPaginationParamsSchema(selectUserSchema.keyof(), [{ key: "updatedAt", order: SortOrder.Desc }]));
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;

const readMembersByIdsInputSchema = z.object({
  ids: z.array(selectUserSchema.shape.id).min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMembersByIdsInput = z.infer<typeof readMembersByIdsInputSchema>;

const createMembersInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userIds: z.array(selectUserSchema.shape.id).min(1),
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
  createInvite: getRoomOwnerProcedure(createInviteInputSchema, "roomId")
    .input(createInviteInputSchema)
    .mutation<null | string>(async ({ ctx, input: { roomId } }) => {
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

      throw new TRPCError({
        code: "UNPROCESSABLE_CONTENT",
        message: "Failed to create invite code. Please try again.",
      });
    }),
  createMembers: getRoomOwnerProcedure(createMembersInputSchema, "roomId")
    .input(createMembersInputSchema)
    .mutation<UserToRoom[]>(({ ctx, input: { roomId, userIds } }) =>
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
  createRoom: getProfanityFilterProcedure(createRoomInputSchema, ["name"])
    .input(createRoomInputSchema)
    .mutation<null | Room>(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const newRoom = (
          await tx
            .insert(rooms)
            .values({ ...input, userId: ctx.session.user.id })
            .returning()
        ).find(Boolean);
        if (!newRoom) return null;

        await tx.insert(usersToRooms).values({ roomId: newRoom.id, userId: ctx.session.user.id });
        return newRoom;
      }),
    ),
  deleteRoom: authedProcedure.input(deleteRoomInputSchema).mutation<null | Room>(async ({ ctx, input }) => {
    const deletedRoom = (
      await ctx.db
        .delete(rooms)
        .where(and(eq(rooms.id, input), eq(rooms.userId, ctx.session.user.id)))
        .returning()
    ).find(Boolean);
    return deletedRoom ?? null;
  }),
  joinRoom: authedProcedure.input(joinRoomInputSchema).mutation<null | UserToRoom>(async ({ ctx, input }) => {
    const invite = await ctx.db.query.invites.findFirst({ where: (invites, { eq }) => eq(invites.code, input) });
    if (!invite) return null;

    const userToRoom = (
      await ctx.db.insert(usersToRooms).values({ roomId: invite.roomId, userId: ctx.session.user.id }).returning()
    ).find(Boolean);
    return userToRoom ?? null;
  }),
  leaveRoom: authedProcedure.input(leaveRoomInputSchema).mutation<null | UserToRoom>(async ({ ctx, input }) => {
    const userToRoom = (
      await ctx.db
        .delete(usersToRooms)
        .where(and(eq(usersToRooms.roomId, input), eq(usersToRooms.userId, ctx.session.user.id)))
        .returning()
    ).find(Boolean);
    return userToRoom ?? null;
  }),
  readInvite: authedProcedure.input(readInviteInputSchema).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.invites.findFirst({
        where: (invites, { eq }) => eq(invites.code, input),
        with: InviteRelations,
      })) ?? null,
  ),
  readInviteCode: getRoomOwnerProcedure(readInviteCodeInputSchema, "roomId")
    .input(readInviteCodeInputSchema)
    .query<null | string>(async ({ ctx, input: { roomId } }) => readInviteCode(ctx.db, ctx.session.user.id, roomId)),
  readMembers: getRoomUserProcedure(readMembersInputSchema, "roomId")
    .input(readMembersInputSchema)
    .query(async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const filterWhere = ilike(users.name, `%${filter?.name ?? ""}%`);
      const cursorWhere = cursor ? getCursorWhere(users, cursor, sortBy) : undefined;
      const where = cursorWhere ? and(filterWhere, cursorWhere) : filterWhere;
      const joinedUsers = await ctx.db
        .select()
        .from(users)
        .innerJoin(usersToRooms, and(eq(usersToRooms.userId, users.id)))
        .where(and(eq(usersToRooms.roomId, roomId), where))
        .orderBy(...parseSortByToSql(users, sortBy))
        .limit(limit + 1);
      const resultUsers = joinedUsers.map(({ users }) => users);
      return getCursorPaginationData(resultUsers, limit, sortBy);
    }),
  readMembersByIds: getRoomUserProcedure(readMembersByIdsInputSchema, "roomId")
    .input(readMembersByIdsInputSchema)
    .query(async ({ ctx, input: { ids, roomId } }) => {
      const joinedUsers = await ctx.db
        .select()
        .from(users)
        .innerJoin(usersToRooms, and(eq(usersToRooms.userId, users.id)))
        .where(and(eq(usersToRooms.roomId, roomId), inArray(users.id, ids)));
      return joinedUsers.map(({ users }) => users);
    }),
  readRoom: authedProcedure.input(readRoomInputSchema).query<null | Room>(async ({ ctx, input }) => {
    if (input)
      return (
        (await ctx.db.query.rooms.findFirst({
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
        })) ?? null
      );
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
  readRooms: authedProcedure.input(readRoomsInputSchema).query(async ({ ctx, input: { cursor, limit, sortBy } }) => {
    const query = ctx.db
      .select()
      .from(rooms)
      .innerJoin(usersToRooms, and(eq(usersToRooms.roomId, rooms.id), eq(usersToRooms.userId, ctx.session.user.id)));
    if (cursor) query.where(getCursorWhere(rooms, cursor, sortBy));
    query.orderBy(...parseSortByToSql(rooms, sortBy));

    const joinedRooms = await query.limit(limit + 1);
    const resultRooms = joinedRooms.map(({ rooms }) => rooms);
    return getCursorPaginationData(resultRooms, limit, sortBy);
  }),
  updateRoom: getProfanityFilterProcedure(updateRoomInputSchema, ["name"])
    .input(updateRoomInputSchema)
    .mutation<null | Room>(async ({ ctx, input: { id, ...rest } }) => {
      const updatedRoom = (
        await ctx.db
          .update(rooms)
          .set(rest)
          .where(and(eq(rooms.id, id), eq(rooms.userId, ctx.session.user.id)))
          .returning()
      ).find(Boolean);
      return updatedRoom ?? null;
    }),
});
