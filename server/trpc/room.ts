import chatMembers from "@/assets/data/chatMembers.json";
import { createRouter } from "@/server/trpc/createRouter";
import { prisma } from "@/server/trpc/prisma";
import { userSchema } from "@/server/trpc/user";
import { FETCH_LIMIT, ROOM_MAX_NAME_LENGTH } from "@/util/constants";
import type { Room as PrismaRoom, User } from "@prisma/client";
import { toZod } from "tozod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const roomSchema: toZod<Omit<PrismaRoom, "updatedAt"> & { updatedAt: string }> = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(ROOM_MAX_NAME_LENGTH),
  avatar: z.string().nullable(),
  createdAt: z.date(),
  // @NOTE Change back to date after we add superjson
  updatedAt: z.string(),
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

export const roomRouter = createRouter()
  .query("readRoom", {
    input: readRoomInputSchema,
    resolve: async ({ input }) => {
      if (input) return prisma.room.findFirst({ where: { id: input } });
      else return prisma.room.findFirst({ orderBy: { updatedAt: "desc" } });
    },
  })
  .query("readRooms", {
    input: readRoomsInputSchema,
    resolve: async ({ input: { filter, cursor } }) => {
      const name = filter?.name;
      const rooms = await prisma.room.findMany({
        take: FETCH_LIMIT + 1,
        where: name ? { name: { contains: name, mode: "insensitive" } } : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
      });

      let nextCursor: typeof cursor = null;
      if (rooms.length > FETCH_LIMIT) {
        const nextRoom = rooms.pop();
        if (nextRoom) nextCursor = nextRoom.id;
      }

      return { rooms, nextCursor };
    },
  })
  .mutation("createRoom", {
    input: createRoomInputSchema,
    resolve: ({ input }) => prisma.room.create({ data: { id: uuidv4(), ...input } }),
  })
  .mutation("updateRoom", {
    input: updateRoomInputSchema,
    // @NOTE Remove manual Date transformation when we add superjson
    resolve: ({ input: { id, ...other } }) =>
      prisma.room.update({
        data: { ...other, updatedAt: other.updatedAt ? new Date(other.updatedAt) : undefined },
        where: { id },
      }),
  })
  .mutation("deleteRoom", {
    input: deleteRoomInputSchema,
    resolve: async ({ input }) => {
      try {
        await prisma.room.delete({ where: { id: input } });
        return true;
      } catch (err) {
        return false;
      }
    },
  })
  .query("readMembers", {
    input: readMembersInputSchema,
    resolve: async ({ input: { cursor } }) => {
      const members = await prisma.user.findMany({
        take: FETCH_LIMIT + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
      });

      let nextCursor: typeof cursor = null;
      if (members.length > FETCH_LIMIT) {
        const nextMember = members.pop();
        if (nextMember) nextCursor = nextMember.id;
      }

      return { members: chatMembers as User[], nextCursor };
    },
  })
  .mutation("addMembers", {
    input: addMembersInputSchema,
    resolve: async ({ input: { roomId, userIds } }) => {
      const payload = await prisma.roomsOnUsers.createMany({ data: userIds.map((userId) => ({ roomId, userId })) });
      return payload.count;
    },
  });
