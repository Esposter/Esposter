import { db } from "@/db";
import { rooms, selectRoomSchema } from "@/db/schema/rooms";
import { selectUserSchema, users, usersToRooms } from "@/db/schema/users";
import { AzureTable } from "@/models/azure/table";
import { InviteEntity, InviteEntityPropertyNames, inviteCodeSchema } from "@/models/esbabbler/room/invite";
import { createCursorPaginationParamsSchema } from "@/models/shared/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "@/models/shared/pagination/sorting/SortOrder";
import { router } from "@/server/trpc";
import { authedProcedure, getRoomOwnerProcedure, getRoomUserProcedure } from "@/server/trpc/procedure";
import { DEFAULT_PARTITION_KEY } from "@/services/azure/constants";
import { createEntity, getTableClient, getTopNEntities } from "@/services/azure/table";
import { getCursorPaginationData } from "@/services/shared/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@/services/shared/pagination/cursor/getCursorWhere";
import { convertSortByToSql } from "@/services/shared/pagination/sorting/convertSortByToSql";
import { generateCode } from "@/util/math/random/generateCode";
import { odata } from "@azure/data-tables";
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
    roomId: selectRoomSchema.shape.id,
    filter: selectUserSchema.pick({ name: true }).optional(),
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
// as the SQL clauses inherently contains logic to filter if the user is a member/creator of the room
export const roomRouter = router({
  readRoom: authedProcedure.input(readRoomInputSchema).query(async ({ input, ctx }) => {
    if (input) {
      const joinedRoom = (
        await db
          .select()
          .from(rooms)
          .innerJoin(usersToRooms, and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, input)))
      )[0];
      return joinedRoom ? joinedRoom.Room : null;
    }

    // By default, we will return the latest updated room
    const joinedRoom = (
      await db
        .select()
        .from(rooms)
        .innerJoin(usersToRooms, eq(usersToRooms.userId, ctx.session.user.id))
        .orderBy(desc(rooms.updatedAt))
    )[0];
    return joinedRoom ? joinedRoom.Room : null;
  }),
  readRooms: authedProcedure.input(readRoomsInputSchema).query(async ({ input: { cursor, limit, sortBy }, ctx }) => {
    const query = db.select().from(rooms).innerJoin(usersToRooms, eq(usersToRooms.userId, ctx.session.user.id));
    if (cursor) query.where(getCursorWhere(rooms, cursor, sortBy));
    query.orderBy(...convertSortByToSql(rooms, sortBy));

    const joinedRooms = await query.limit(limit + 1);
    const resultRooms = joinedRooms.map((jr) => jr.Room);
    return getCursorPaginationData(resultRooms, limit, sortBy);
  }),
  createRoom: authedProcedure.input(createRoomInputSchema).mutation(({ input, ctx }) =>
    db.transaction(async (tx) => {
      const newRoom = (
        await tx
          .insert(rooms)
          .values({ ...input, creatorId: ctx.session.user.id })
          .returning()
      )[0];
      await tx.insert(usersToRooms).values({ userId: ctx.session.user.id, roomId: newRoom.id });
      return newRoom;
    }),
  ),
  updateRoom: authedProcedure.input(updateRoomInputSchema).mutation(async ({ input: { id, ...rest }, ctx }) => {
    const updatedRoom = (
      await db
        .update(rooms)
        .set(rest)
        .where(and(eq(rooms.id, id), eq(rooms.creatorId, ctx.session.user.id)))
        .returning()
    )[0];
    return updatedRoom;
  }),
  deleteRoom: authedProcedure.input(deleteRoomInputSchema).mutation(async ({ input, ctx }) => {
    await db.delete(rooms).where(and(eq(rooms.id, input), eq(rooms.creatorId, ctx.session.user.id)));
  }),
  joinRoom: authedProcedure.input(joinRoomInputSchema).mutation(async ({ input, ctx }) => {
    const inviteClient = await getTableClient(AzureTable.Invites);
    const invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
      filter: odata`PartitionKey eq ${DEFAULT_PARTITION_KEY} and RowKey eq ${input}`,
    });
    if (invites.length === 0) return false;

    const invite = invites[0];
    await db.insert(usersToRooms).values({ userId: ctx.session.user.id, roomId: invite.roomId });
    return true;
  }),
  leaveRoom: authedProcedure.input(leaveRoomInputSchema).mutation(async ({ input, ctx }) => {
    await db
      .delete(usersToRooms)
      .where(and(eq(usersToRooms.userId, ctx.session.user.id), eq(usersToRooms.roomId, input)));
  }),
  readMembers: getRoomUserProcedure(readMembersInputSchema, "roomId")
    .input(readMembersInputSchema)
    .query(async ({ input: { roomId, filter, cursor, limit, sortBy } }) => {
      const filterWhere = ilike(users.name, `%${filter?.name ?? ""}%`);
      const cursorWhere = cursor ? getCursorWhere(users, cursor, sortBy) : undefined;
      const where = cursorWhere ? and(filterWhere, cursorWhere) : filterWhere;

      const joinedUsers = await db
        .select()
        .from(users)
        .innerJoin(usersToRooms, and(eq(usersToRooms.userId, users.id), eq(usersToRooms.roomId, roomId)))
        .where(where)
        .orderBy(...convertSortByToSql(users, sortBy))
        .limit(limit + 1);
      const resultUsers = joinedUsers.map((ju) => ju.User);
      return getCursorPaginationData(resultUsers, limit, sortBy);
    }),
  createMembers: getRoomOwnerProcedure(createMembersInputSchema, "roomId")
    .input(createMembersInputSchema)
    .mutation(async ({ input: { roomId, userIds } }) => {
      await db.transaction((tx) =>
        Promise.all([userIds.map((userId) => tx.insert(usersToRooms).values({ userId, roomId }).returning())]),
      );
    }),
  generateInviteCode: getRoomOwnerProcedure(generateInviteCodeInputSchema, "roomId")
    .input(generateInviteCodeInputSchema)
    .mutation(async ({ input: { roomId } }) => {
      const inviteClient = await getTableClient(AzureTable.Invites);
      // We only allow one invite code per room
      // So let's return the code to the user if it exists
      let invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
        filter: odata`PartitionKey eq ${DEFAULT_PARTITION_KEY} and ${InviteEntityPropertyNames.roomId} eq ${roomId}`,
      });
      if (invites.length > 0) return invites[0].rowKey;

      // Generate non-colliding invite code
      let inviteCode = generateCode(8);
      invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
        filter: odata`PartitionKey eq ${DEFAULT_PARTITION_KEY} and RowKey eq ${inviteCode}`,
      });

      while (invites.length > 0) {
        inviteCode = generateCode(8);
        invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
          filter: odata`PartitionKey eq ${DEFAULT_PARTITION_KEY} and RowKey eq ${inviteCode}`,
        });
      }

      const createdAt = new Date();
      const newInvite = new InviteEntity({
        partitionKey: DEFAULT_PARTITION_KEY,
        rowKey: inviteCode,
        roomId,
        createdAt,
        updatedAt: createdAt,
      });
      await createEntity(inviteClient, newInvite);
      return inviteCode;
    }),
});
