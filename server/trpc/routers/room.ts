import chatMembers from "@/assets/data/chatMembers.json";
import { testUser } from "@/assets/data/test";
import { prisma } from "@/prisma";
import { router } from "@/server/trpc";
import { rateLimitedProcedure } from "@/server/trpc/procedure";
import { userSchema } from "@/server/trpc/routers/user";
import { FETCH_LIMIT, ROOM_MAX_NAME_LENGTH } from "@/util/constants.common";
import { getNextCursor } from "@/util/pagination";
import type { Room as PrismaRoom, User } from "@prisma/client";
import { toZod } from "tozod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const roomSchema: toZod<PrismaRoom> = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(ROOM_MAX_NAME_LENGTH),
  avatar: z.string().nullable(),
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

const readMembersInputSchema = z.object({
  filter: roomSchema.pick({ name: true }).optional(),
  cursor: z.string().nullable(),
});
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;

const addMembersInputSchema = z.object({
  roomId: roomSchema.shape.id,
  userIds: z.array(userSchema.shape.id).min(1),
});
export type AddMembersInput = z.infer<typeof addMembersInputSchema>;

export const roomRouter = router({
  readRoom: rateLimitedProcedure
    .input(readRoomInputSchema)
    .query(({ input }) =>
      input
        ? prisma.room.findUnique({ where: { id: input } })
        : prisma.room.findFirst({ orderBy: { updatedAt: "desc" } })
    ),
  readRooms: rateLimitedProcedure.input(readRoomsInputSchema).query(async ({ input: { filter, cursor } }) => {
    const name = filter?.name;
    const rooms = await prisma.room.findMany({
      take: FETCH_LIMIT + 1,
      where: { name: { contains: name, mode: "insensitive" } },
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { updatedAt: "desc" },
    });
    return { rooms, nextCursor: getNextCursor(rooms, "id", FETCH_LIMIT) };
  }),
  createRoom: rateLimitedProcedure
    .input(createRoomInputSchema)
    .mutation(({ input }) => prisma.room.create({ data: { ...input, id: uuidv4() } })),
  updateRoom: rateLimitedProcedure
    .input(updateRoomInputSchema)
    .mutation(({ input: { id, ...other } }) => prisma.room.update({ data: other, where: { id } })),
  deleteRoom: rateLimitedProcedure.input(deleteRoomInputSchema).mutation(async ({ input }) => {
    try {
      await prisma.room.delete({ where: { id: input } });
      return true;
    } catch (err) {
      return false;
    }
  }),
  readMembers: rateLimitedProcedure.input(readMembersInputSchema).query(async ({ input: { cursor } }) => {
    const members = await prisma.user.findMany({
      take: FETCH_LIMIT + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { updatedAt: "desc" },
    });
    return {
      members: (chatMembers as unknown as User[]).concat(testUser),
      nextCursor: getNextCursor(members, "id", FETCH_LIMIT),
    };
  }),
  addMembers: rateLimitedProcedure.input(addMembersInputSchema).mutation(async ({ input: { roomId, userIds } }) => {
    const payload = await prisma.roomsOnUsers.createMany({ data: userIds.map((userId) => ({ roomId, userId })) });
    return payload.count;
  }),
});
