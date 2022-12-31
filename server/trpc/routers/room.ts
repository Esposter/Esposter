import { prisma } from "@/prisma";
import { router } from "@/server/trpc";
import { authedProcedure, getRoomUserProcedure } from "@/server/trpc/procedure";
import { userSchema } from "@/server/trpc/routers/user";
import { FETCH_LIMIT, ROOM_NAME_MAX_LENGTH } from "@/util/constants.common";
import { getNextCursor } from "@/util/pagination";
import type { Room as PrismaRoom } from "@prisma/client";
import type { toZod } from "tozod";
import { z } from "zod";

export const roomSchema: toZod<PrismaRoom> = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(ROOM_NAME_MAX_LENGTH),
  image: z.string().nullable(),
  creatorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

const readRoomInputSchema = roomSchema.shape.id.optional();
export type ReadRoomInput = z.infer<typeof readRoomInputSchema>;

const readRoomsInputSchema = z.object({
  filter: roomSchema.pick({ name: true }).optional(),
  cursor: z.string().nullable(),
});
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;

const createRoomInputSchema = roomSchema.pick({ name: true });
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

const updateRoomInputSchema = roomSchema
  .pick({ id: true })
  .merge(roomSchema.partial().pick({ name: true, updatedAt: true }));
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;

const deleteRoomInputSchema = roomSchema.shape.id;
export type DeleteRoomInput = z.infer<typeof deleteRoomInputSchema>;

const readMembersInputSchema = z.object({ roomId: roomSchema.shape.id });
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;

const createMembersInputSchema = z.object({
  roomId: roomSchema.shape.id,
  userIds: z.array(userSchema.shape.id).min(1),
});
export type CreateMembersInput = z.infer<typeof createMembersInputSchema>;

// For room-related queries/mutations we don't need to grab the room user procedure
// as the SQL WHERE clause inherently contains logic to check if the user is a member/creator of the room
export const roomRouter = router({
  readRoom: authedProcedure.input(readRoomInputSchema).query(({ input, ctx }) =>
    input
      ? prisma.room.findFirst({ where: { id: input, users: { some: { userId: ctx.session.user.id } } } })
      : prisma.room.findFirst({
          where: { users: { some: { userId: ctx.session.user.id } } },
          orderBy: { updatedAt: "desc" },
        })
  ),
  readRooms: authedProcedure.input(readRoomsInputSchema).query(async ({ input: { filter, cursor }, ctx }) => {
    const name = filter?.name;
    const rooms = await prisma.room.findMany({
      take: FETCH_LIMIT + 1,
      where: { name: { contains: name, mode: "insensitive" }, users: { some: { userId: ctx.session.user.id } } },
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { updatedAt: "desc" },
    });
    return { rooms, nextCursor: getNextCursor(rooms, "id", FETCH_LIMIT) };
  }),
  createRoom: authedProcedure.input(createRoomInputSchema).mutation(({ input, ctx }) =>
    prisma.room.create({
      data: { ...input, creatorId: ctx.session.user.id, users: { create: { userId: ctx.session.user.id } } },
    })
  ),
  updateRoom: authedProcedure.input(updateRoomInputSchema).mutation(async ({ input: { id, ...other }, ctx }) => {
    // @NOTE: We should be able to return records we updated on updateMany in the future
    // https://github.com/prisma/prisma/issues/5019
    const { count } = await prisma.room.updateMany({ data: other, where: { id, creatorId: ctx.session.user.id } });
    return count === 1 ? prisma.room.findUnique({ where: { id } }) : null;
  }),
  deleteRoom: authedProcedure.input(deleteRoomInputSchema).mutation(async ({ input, ctx }) => {
    try {
      const { count } = await prisma.room.deleteMany({ where: { id: input, creatorId: ctx.session.user.id } });
      return count === 1;
    } catch (err) {
      return false;
    }
  }),
  readMembers: getRoomUserProcedure(readMembersInputSchema, "roomId")
    .input(readMembersInputSchema)
    .query(async ({ input: { roomId } }) => {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { users: { include: { user: true } } },
      });
      return room ? { members: room.users.map((u) => u.user) } : null;
    }),
  createMembers: getRoomUserProcedure(createMembersInputSchema, "roomId")
    .input(createMembersInputSchema)
    .mutation(async ({ input: { roomId, userIds } }) => {
      const payload = await prisma.roomsOnUsers.createMany({ data: userIds.map((userId) => ({ roomId, userId })) });
      return payload.count;
    }),
});
