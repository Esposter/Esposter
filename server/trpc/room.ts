import chatMembers from "@/assets/data/chatMembers.json";
import { createRouter } from "@/server/trpc/createRouter";
import { prisma } from "@/server/trpc/prisma";
import { FETCH_LIMIT, getQueryFetchLimit, ROOM_MAX_NAME_LENGTH } from "@/util/constants";
import type { Room as PrismaRoom } from "@prisma/client";
import { toZod } from "tozod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const roomSchema: toZod<Omit<PrismaRoom, "updatedAt"> & { updatedAt: string }> = z.object({
  id: z.string(),
  name: z.string().min(1).max(ROOM_MAX_NAME_LENGTH),
  avatar: z.string().nullable(),
  createdAt: z.date(),
  // @NOTE Change back to date after we add superjson
  updatedAt: z.string(),
  deletedAt: z.date().nullable(),
});

const readRoomsInputSchema = z
  .object({
    filter: roomSchema.pick({ name: true }).optional(),
    cursor: z.string().nullable(),
  })
  .optional();
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;

const createRoomInputSchema = roomSchema.pick({ name: true });
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

const updateRoomInputSchema = roomSchema
  .pick({ id: true })
  .merge(roomSchema.partial().pick({ name: true, updatedAt: true }));
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;

const deleteRoomInputSchema = roomSchema.pick({ id: true });
export type DeleteRoomInput = z.infer<typeof deleteRoomInputSchema>;

export const roomRouter = createRouter()
  .query("readRooms", {
    input: readRoomsInputSchema,
    resolve: async ({ input }) => {
      const name = input?.filter?.name;
      const cursor = input?.cursor;
      const rooms = await prisma.room.findMany({
        take: getQueryFetchLimit(),
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
    resolve: ({ input: { id, ...other } }) => {
      // @NOTE Remove manual Date transformation when we add superjson
      return prisma.room.update({
        data: { ...other, updatedAt: other.updatedAt ? new Date(other.updatedAt) : undefined },
        where: { id },
      });
    },
  })
  .mutation("deleteRoom", {
    input: deleteRoomInputSchema,
    resolve: async ({ input: { id } }) => {
      try {
        await prisma.room.delete({ where: { id } });
        return true;
      } catch (err) {
        return false;
      }
    },
  })
  .query("readMembers", {
    resolve: () => chatMembers,
  });
