import chatMembers from "@/assets/data/chatMembers.json";
import chatMessages from "@/assets/data/chatMessages.json";
import chatRooms from "@/assets/data/chatRooms.json";
import { createRouter } from "@/server/trpc/createRouter";
import { ROOM_MAX_NAME_LENGTH } from "@/util/constants";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const roomSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(ROOM_MAX_NAME_LENGTH),
  avatar: z.string().optional(),
  subtitle: z.string().optional(),
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
    resolve: ({ input }) => {
      const nameFilter = input?.filter?.name;
      if (!nameFilter) return chatRooms;
      return chatRooms.filter((r) => r.name.toLowerCase().includes(nameFilter.toLowerCase()));
    },
  })
  .mutation("createRoom", {
    input: createRoomInputSchema,
    resolve: ({ input }) => {
      const newRoom: Room = { id: uuidv4(), ...input };
      (chatRooms as Room[]).push(newRoom);
      return newRoom;
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
