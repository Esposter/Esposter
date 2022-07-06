import chatMembers from "@/assets/data/chatMembers.json";
import chatMessages from "@/assets/data/chatMessages.json";
import { createRouter } from "@/server/trpc/createRouter";
import { ROOM_MAX_NAME_LENGTH } from "@/util/constants";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const roomSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(ROOM_MAX_NAME_LENGTH),
  avatar: z.string().optional(),
});
export type Room = z.infer<typeof roomSchema>;

const roomSchemaPartial = roomSchema.partial();

const createRoomInputSchema = roomSchema.pick({ name: true });
export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

const messageSchema = z.object({ id: z.string(), userId: z.string(), message: z.string() });
export type Message = z.infer<typeof messageSchema>;

const createMessageInputSchema = messageSchema.pick({ message: true });
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const roomRouter = createRouter()
  .query("getRooms", {
    input: z
      .object({
        filter: roomSchemaPartial.pick({ name: true }).optional(),
      })
      .optional(),
    resolve: async ({ input, ctx }) => {
      const nameFilter = input?.filter?.name;
      if (!nameFilter) return ctx.prisma.room.findMany();
      return ctx.prisma.room.findMany({ where: { name: { contains: nameFilter } } });
    },
  })
  .mutation("createRoom", {
    input: createRoomInputSchema,
    resolve: async ({ input, ctx }) => {
      return ctx.prisma.room.create({ data: { id: uuidv4(), ...input } });
    },
  })
  .mutation("deleteRoom", {
    input: roomSchema.pick({ id: true }),
    resolve: async ({ input: { id }, ctx }) => {
      try {
        await ctx.prisma.room.delete({ where: { id } });
        return true;
      } catch (err) {
        return false;
      }
    },
  })
  .query("getMembers", {
    resolve: () => chatMembers,
  })
  .query("getMessages", {
    resolve: () => chatMessages,
  })
  .mutation("createMessage", {
    input: createMessageInputSchema,
    resolve: ({ input }) => {
      const newMessage: Message = { id: uuidv4(), ...input, userId: "1" };
      (chatMessages as Message[]).unshift(newMessage);
      return newMessage;
    },
  });
