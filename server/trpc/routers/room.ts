import { AzureTable } from "@/models/azure/table";
import { roomSchema } from "@/models/esbabbler/room";
import { InviteEntity, inviteCodeSchema } from "@/models/esbabbler/room/invite";
import { prisma } from "@/prisma";
import { router } from "@/server/trpc";
import { authedProcedure, getRoomOwnerProcedure, getRoomUserProcedure } from "@/server/trpc/procedure";
import { userSchema } from "@/server/trpc/routers/user";
import { createEntity, getTableClient, getTopNEntities } from "@/services/azure/table";
import { INVITES_PARTITION_KEY } from "@/services/room/table";
import { READ_LIMIT, getNextCursor } from "@/utils/pagination";
import { generateCode } from "@/utils/random";
import { odata } from "@azure/data-tables";
import { User } from "@prisma/client";
import { z } from "zod";

const readRoomInputSchema = roomSchema.shape.id.optional();
export type ReadRoomInput = z.infer<typeof readRoomInputSchema>;

const readRoomsInputSchema = z.object({ cursor: z.string().nullable() });
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;

const createRoomInputSchema = roomSchema.pick({ name: true });
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

const updateRoomInputSchema = roomSchema.pick({ id: true }).merge(roomSchema.partial().pick({ name: true }));
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;

const deleteRoomInputSchema = roomSchema.shape.id;
export type DeleteRoomInput = z.infer<typeof deleteRoomInputSchema>;

const joinRoomInputSchema = inviteCodeSchema.shape.rowKey;
export type JoinRoomInput = z.infer<typeof joinRoomInputSchema>;

const leaveRoomInputSchema = roomSchema.shape.id;
export type LeaveRoomInput = z.infer<typeof leaveRoomInputSchema>;

const readMembersInputSchema = z.object({
  roomId: roomSchema.shape.id,
  filter: userSchema.pick({ name: true }).optional(),
});
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;

const createMembersInputSchema = z.object({
  roomId: roomSchema.shape.id,
  userIds: z.array(userSchema.shape.id).min(1),
});
export type CreateMembersInput = z.infer<typeof createMembersInputSchema>;

const generateInviteCodeInputSchema = z.object({
  roomId: roomSchema.shape.id,
});
export type GenerateInviteCodeInput = z.infer<typeof generateInviteCodeInputSchema>;

// For room-related queries/mutations we don't need to grab the room user procedure
// as the SQL WHERE clause inherently contains logic to check if the user is a member/creator of the room
export const roomRouter = router({
  readRoom: authedProcedure.input(readRoomInputSchema).query(({ input, ctx }) =>
    input
      ? prisma.room.findFirst({ where: { id: input, users: { some: { userId: ctx.session.user.id } } } })
      : prisma.room.findFirst({
          where: { users: { some: { userId: ctx.session.user.id } } },
          orderBy: { updatedAt: "desc" },
        }),
  ),
  readRooms: authedProcedure.input(readRoomsInputSchema).query(async ({ input: { cursor }, ctx }) => {
    const rooms = await prisma.room.findMany({
      take: READ_LIMIT + 1,
      where: { users: { some: { userId: ctx.session.user.id } } },
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { updatedAt: "desc" },
    });
    return { rooms, nextCursor: getNextCursor(rooms, "id", READ_LIMIT) };
  }),
  createRoom: authedProcedure.input(createRoomInputSchema).mutation(({ input, ctx }) =>
    prisma.room.create({
      data: { ...input, creatorId: ctx.session.user.id, users: { create: { userId: ctx.session.user.id } } },
    }),
  ),
  updateRoom: authedProcedure.input(updateRoomInputSchema).mutation(async ({ input: { id, ...rest }, ctx }) => {
    // @NOTE: We should be able to return records we updated on updateMany in the future
    // https://github.com/prisma/prisma/issues/5019
    const { count } = await prisma.room.updateMany({ data: rest, where: { id, creatorId: ctx.session.user.id } });
    return count === 1 ? prisma.room.findUnique({ where: { id } }) : null;
  }),
  deleteRoom: authedProcedure.input(deleteRoomInputSchema).mutation(async ({ input, ctx }) => {
    const count = await prisma.$transaction(async (prisma) => {
      await prisma.roomsOnUsers.deleteMany({ where: { roomId: input } });
      const { count } = await prisma.room.deleteMany({
        where: { id: input, creatorId: ctx.session.user.id },
      });
      return count;
    });
    return count === 1;
  }),
  joinRoom: authedProcedure.input(joinRoomInputSchema).mutation(async ({ input, ctx }) => {
    const inviteClient = await getTableClient(AzureTable.Invites);
    const invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
      filter: odata`PartitionKey eq ${INVITES_PARTITION_KEY} and RowKey eq ${input}`,
    });
    if (invites.length === 0) return false;

    const invite = invites[0];
    await prisma.roomsOnUsers.create({ data: { userId: ctx.session.user.id, roomId: invite.roomId } });
    return true;
  }),
  leaveRoom: authedProcedure.input(leaveRoomInputSchema).mutation(async ({ input, ctx }) => {
    await prisma.roomsOnUsers.delete({ where: { userId_roomId: { userId: ctx.session.user.id, roomId: input } } });
    return true;
  }),
  readMembers: getRoomUserProcedure(readMembersInputSchema, "roomId")
    .input(readMembersInputSchema)
    .query<User[]>(async ({ input: { roomId, filter } }) => {
      const name = filter?.name ?? undefined;
      const members = await prisma.user.findMany({
        where: { name: { contains: name, mode: "insensitive" }, rooms: { some: { roomId } } },
      });
      return members;
    }),
  createMembers: getRoomUserProcedure(createMembersInputSchema, "roomId")
    .input(createMembersInputSchema)
    .mutation(async ({ input: { roomId, userIds } }) => {
      const payload = await prisma.roomsOnUsers.createMany({ data: userIds.map((userId) => ({ roomId, userId })) });
      return payload.count;
    }),
  generateInviteCode: getRoomOwnerProcedure(generateInviteCodeInputSchema, "roomId")
    .input(generateInviteCodeInputSchema)
    .mutation(async ({ input: { roomId } }) => {
      const inviteClient = await getTableClient(AzureTable.Invites);
      // We only allow one invite code per room
      // So let's return the code to the user if it exists
      let invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
        filter: odata`PartitionKey eq ${INVITES_PARTITION_KEY} and roomId eq ${roomId}`,
      });
      if (invites.length > 0) return invites[0].rowKey;

      // Generate non-colliding invite code
      let inviteCode = generateCode(8);
      invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
        filter: odata`PartitionKey eq ${INVITES_PARTITION_KEY} and RowKey eq ${inviteCode}`,
      });

      while (invites.length > 0) {
        inviteCode = generateCode(8);
        invites = await getTopNEntities(inviteClient, 1, InviteEntity, {
          filter: odata`PartitionKey eq ${INVITES_PARTITION_KEY} and RowKey eq ${inviteCode}`,
        });
      }

      const createdAt = new Date();
      const newInvite = new InviteEntity({
        partitionKey: INVITES_PARTITION_KEY,
        rowKey: inviteCode,
        roomId,
        createdAt,
        updatedAt: createdAt,
      });
      await createEntity(inviteClient, newInvite);
      return inviteCode;
    }),
});
