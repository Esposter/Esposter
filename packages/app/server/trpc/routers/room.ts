import type { Room } from "#shared/db/schema/rooms";
import type { UserToRoom } from "#shared/db/schema/users";

import { rooms, selectRoomSchema } from "#shared/db/schema/rooms";
import { selectUserSchema, users, usersToRooms } from "#shared/db/schema/users";
import { inviteCodeSchema, InviteEntity, InviteEntityPropertyNames } from "#shared/models/esbabbler/room/invite";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { generateCode } from "#shared/util/math/random/generateCode";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { AZURE_DEFAULT_PARTITION_KEY } from "@@/server/services/azure/table/constants";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { getProfanityFilterProcedure } from "@@/server/trpc/procedure/getProfanityFilterProcedure";
import { getRoomOwnerProcedure } from "@@/server/trpc/procedure/getRoomOwnerProcedure";
import { getRoomUserProcedure } from "@@/server/trpc/procedure/getRoomUserProcedure";
import { useTableClient } from "@@/server/util/azure/useTableClient";
import { and, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

const readRoomInputSchema = selectRoomSchema.shape.id.optional();
export type ReadRoomInput = z.infer<typeof readRoomInputSchema>;

const readRoomsInputSchema = createCursorPaginationParamsSchema(selectRoomSchema.keyof(), [
  { key: "updatedAt", order: SortOrder.Desc },
]).default({});
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;

const createRoomInputSchema = selectRoomSchema.pick({ name: true });
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

const updateRoomInputSchema = selectRoomSchema
  .pick({ id: true })
  .merge(selectRoomSchema.partial().pick({ name: true }));
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;

const deleteRoomInputSchema = selectRoomSchema.shape.id;
export type DeleteRoomInput = z.infer<typeof deleteRoomInputSchema>;

const joinRoomInputSchema = inviteCodeSchema.shape.rowKey;
export type JoinRoomInput = z.infer<typeof joinRoomInputSchema>;

const leaveRoomInputSchema = selectRoomSchema.shape.id;
export type LeaveRoomInput = z.infer<typeof leaveRoomInputSchema>;

const readMembersInputSchema = z
  .object({
    filter: selectUserSchema.pick({ name: true }).optional(),
    roomId: selectRoomSchema.shape.id,
  })
  .merge(createCursorPaginationParamsSchema(selectUserSchema.keyof(), [{ key: "updatedAt", order: SortOrder.Desc }]));
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;

const createMembersInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userIds: z.array(selectUserSchema.shape.id).min(1),
});
export type CreateMembersInput = z.infer<typeof createMembersInputSchema>;

const generateInviteCodeInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
});
export type GenerateInviteCodeInput = z.infer<typeof generateInviteCodeInputSchema>;

// For room-related queries/mutations we don't need to grab the room user procedure
// as the SQL clauses inherently contain logic to filter if the user is a member/creator of the room
export const roomRouter = router({
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
  generateInviteCode: getRoomOwnerProcedure(generateInviteCodeInputSchema, "roomId")
    .input(generateInviteCodeInputSchema)
    .mutation<string>(async ({ input: { roomId } }) => {
      const inviteClient = await useTableClient(AzureTable.Invites);
      // We only allow one invite code per room
      // So let's return the code to the user if it exists
      let invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
        filter: `PartitionKey eq '${AZURE_DEFAULT_PARTITION_KEY}' and ${InviteEntityPropertyNames.roomId} eq '${roomId}'`,
      });
      if (invites.length > 0) return invites[0].rowKey;

      // Generate non-colliding invite code
      let inviteCode = generateCode(8);
      invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
        filter: `PartitionKey eq '${AZURE_DEFAULT_PARTITION_KEY}' and RowKey eq '${inviteCode}'`,
      });

      while (invites.length > 0) {
        inviteCode = generateCode(8);
        invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
          filter: `PartitionKey eq '${AZURE_DEFAULT_PARTITION_KEY}' and RowKey eq '${inviteCode}'`,
        });
      }

      const createdAt = new Date();
      const newInvite = new InviteEntity({
        createdAt,
        partitionKey: AZURE_DEFAULT_PARTITION_KEY,
        roomId,
        rowKey: inviteCode,
        updatedAt: createdAt,
      });
      await createEntity(inviteClient, newInvite);
      return inviteCode;
    }),
  joinRoom: authedProcedure.input(joinRoomInputSchema).mutation<null | UserToRoom>(async ({ ctx, input }) => {
    const inviteClient = await useTableClient(AzureTable.Invites);
    const invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
      filter: `PartitionKey eq '${AZURE_DEFAULT_PARTITION_KEY}' and RowKey eq '${input}'`,
    });
    if (invites.length === 0) return null;

    const [invite] = invites;
    const userToRoom = (
      await ctx.db.insert(usersToRooms).values({ roomId: invite.roomId, userId: ctx.session.user.id }).returning()
    ).find(Boolean);
    return userToRoom ?? null;
  }),
  leaveRoom: authedProcedure.input(leaveRoomInputSchema).mutation<null | UserToRoom>(async ({ ctx, input }) => {
    const userToRoom = (
      await ctx.db
        .delete(usersToRooms)
        .where(and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, input)))
        .returning()
    ).find(Boolean);
    return userToRoom ?? null;
  }),
  readMembers: getRoomUserProcedure(readMembersInputSchema, "roomId")
    .input(readMembersInputSchema)
    .query(async ({ ctx, input: { cursor, filter, limit, roomId, sortBy } }) => {
      const filterWhere = ilike(users.name, `%${filter?.name ?? ""}%`);
      const cursorWhere = cursor ? getCursorWhere(users, cursor, sortBy) : undefined;
      const where = cursorWhere ? and(filterWhere, cursorWhere) : filterWhere;
      const joinedUsers = await ctx.db
        .select()
        .from(users)
        .innerJoin(usersToRooms, and(eq(usersToRooms.userId, users.id), eq(usersToRooms.roomId, roomId)))
        .where(where)
        .orderBy(...parseSortByToSql(users, sortBy))
        .limit(limit + 1);
      const resultUsers = joinedUsers.map((ju) => ju.User);
      return getCursorPaginationData(resultUsers, limit, sortBy);
    }),
  readRoom: authedProcedure.input(readRoomInputSchema).query<null | Room>(async ({ ctx, input }) => {
    if (input) {
      const joinedRoom = (
        await ctx.db
          .select()
          .from(rooms)
          .innerJoin(usersToRooms, and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, input)))
      ).find(Boolean);
      return joinedRoom?.Room ?? null;
    }

    // By default, we will return the latest updated room
    const joinedRoom = (
      await ctx.db
        .select()
        .from(rooms)
        .innerJoin(usersToRooms, eq(usersToRooms.userId, ctx.session.user.id))
        .orderBy(desc(rooms.updatedAt))
    ).find(Boolean);
    return joinedRoom?.Room ?? null;
  }),
  readRooms: authedProcedure.input(readRoomsInputSchema).query(async ({ ctx, input: { cursor, limit, sortBy } }) => {
    const query = ctx.db.select().from(rooms).innerJoin(usersToRooms, eq(usersToRooms.userId, ctx.session.user.id));
    if (cursor) query.where(getCursorWhere(rooms, cursor, sortBy));
    query.orderBy(...parseSortByToSql(rooms, sortBy));

    const joinedRooms = await query.limit(limit + 1);
    const resultRooms = joinedRooms.map((jr) => jr.Room);
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
