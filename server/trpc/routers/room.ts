import { db } from "@/db";
import { rooms, selectRoomSchema } from "@/db/schema/rooms";
import { selectUserSchema, usersToRooms } from "@/db/schema/users";
import { AzureTable } from "@/models/azure/table";
import { InviteEntity, inviteCodeSchema } from "@/models/esbabbler/room/invite";
import { router } from "@/server/trpc";
import { authedProcedure, getRoomOwnerProcedure, getRoomUserProcedure } from "@/server/trpc/procedure";
import { DEFAULT_PARTITION_KEY } from "@/services/azure/constants";
import { createEntity, getTableClient, getTopNEntities } from "@/services/azure/table";
import { READ_LIMIT, getNextCursor } from "@/utils/pagination";
import { generateCode } from "@/utils/random";
import { odata } from "@azure/data-tables";
import { and, eq, gt, ilike } from "drizzle-orm";
import { z } from "zod";

const readRoomInputSchema = selectRoomSchema.shape.id.optional();
export type ReadRoomInput = z.infer<typeof readRoomInputSchema>;

const readRoomsInputSchema = z.object({ cursor: z.string().nullable() });
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

const readMembersInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  filter: selectUserSchema.pick({ name: true }).optional(),
});
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
// as the SQL WHERE clause inherently contains logic to check if the user is a member/creator of the room
export const roomRouter = router({
  readRoom: authedProcedure.input(readRoomInputSchema).query(({ input, ctx }) =>
    input
      ? db.query.rooms.findFirst({
          where: (rooms, { eq }) => eq(rooms.id, input),
          with: {
            usersToRooms: {
              where: (usersToRooms, { eq }) => eq(usersToRooms.userId, ctx.session.user.id),
            },
          },
        })
      : // By default, we will return the latest updated room
        db.query.rooms.findFirst({
          orderBy: (rooms, { desc }) => desc(rooms.updatedAt),
          with: {
            usersToRooms: {
              where: (usersToRooms, { eq }) => eq(usersToRooms.userId, ctx.session.user.id),
            },
          },
        }),
  ),
  readRooms: authedProcedure.input(readRoomsInputSchema).query(async ({ input: { cursor }, ctx }) => {
    const rooms = await db.query.rooms.findMany({
      where: cursor ? (rooms) => gt(rooms.id, cursor) : undefined,
      orderBy: (rooms, { desc }) => desc(rooms.updatedAt),
      limit: READ_LIMIT + 1,
      with: {
        usersToRooms: {
          where: (usersToRooms, { eq }) => eq(usersToRooms.userId, ctx.session.user.id),
        },
      },
    });
    return { rooms, nextCursor: getNextCursor(rooms, "id", READ_LIMIT) };
  }),
  createRoom: authedProcedure.input(createRoomInputSchema).mutation(({ input, ctx }) =>
    db.transaction(async (tx) => {
      const newRoom = (
        await tx
          .insert(rooms)
          .values({
            ...input,
            creatorId: ctx.session.user.id,
          })
          .returning()
      )[0];
      await tx.insert(usersToRooms).values({
        userId: ctx.session.user.id,
        roomId: newRoom.id,
      });
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
    .query(({ input: { roomId, filter } }) =>
      db.query.users.findMany({
        where: (users) => ilike(users.name, `%${filter?.name ?? ""}%`),
        with: {
          usersToRooms: {
            where: (usersToRooms, { eq }) => eq(usersToRooms.roomId, roomId),
          },
        },
      }),
    ),
  createMembers: getRoomUserProcedure(createMembersInputSchema, "roomId")
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
        filter: odata`PartitionKey eq ${DEFAULT_PARTITION_KEY} and roomId eq ${roomId}`,
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
