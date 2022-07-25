import chatMembers from "@/assets/data/chatMembers.json";
import { createRouter } from "@/server/trpc/createRouter";
import { prisma } from "@/server/trpc/prisma";
import { ROOM_MAX_NAME_LENGTH } from "@/util/constants";
import type { Room as PrismaRoom } from "@prisma/client";
import { toZod } from "tozod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const roomSchema: toZod<PrismaRoom> = z.object({
  id: z.string(),
  name: z.string().min(1).max(ROOM_MAX_NAME_LENGTH),
  avatar: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

const readRoomsInputSchema = z.object({ filter: roomSchema.pick({ name: true }).optional() }).optional();
export type ReadRoomsInput = z.infer<typeof readRoomsInputSchema>;

const createRoomInputSchema = roomSchema.pick({ name: true });
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

const updateRoomInputSchema = roomSchema.pick({ id: true, name: true });
export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;

const deleteRoomInputSchema = roomSchema.pick({ id: true });
export type DeleteRoomInput = z.infer<typeof deleteRoomInputSchema>;

export const roomRouter = createRouter()
  .query("readRooms", {
    input: readRoomsInputSchema,
    resolve: ({ input }) => {
      const nameFilter = input?.filter?.name;
      if (!nameFilter) return prisma.room.findMany();
      return prisma.room.findMany({ where: { name: { contains: nameFilter } } });
    },
  })
  .mutation("createRoom", {
    input: createRoomInputSchema,
    resolve: ({ input }) => {
      return prisma.room.create({ data: { id: uuidv4(), ...input } });
    },
  })
  .mutation("updateRoom", {
    input: updateRoomInputSchema,
    resolve: ({ input: { id, ...other } }) => {
      return prisma.room.update({ data: other, where: { id } });
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
