import chatMembers from "@/assets/data/chatMembers.json";
import chatMessages from "@/assets/data/chatMessages.json";
import chatRooms from "@/assets/data/chatRooms.json";
import { createRouter } from "@/server/trpc/createRouter";
import { z } from "zod";

const roomSchema = z.object({ id: z.string(), avatar: z.string(), name: z.string(), subtitle: z.string() });
export type Room = z.infer<typeof roomSchema>;

const messageSchema = z.object({ id: z.string(), userId: z.string(), message: z.string() });
export type Message = z.infer<typeof messageSchema>;

export const roomRouter = createRouter()
  .query("getRooms", {
    input: z.object({ filter: roomSchema.partial().pick({ name: true }).optional() }).optional(),
    resolve: ({ input }) => {
      const nameFilter = input?.filter?.name;
      if (!nameFilter) return chatRooms;
      return chatRooms.filter((r) => r.name.toLowerCase().includes(nameFilter.toLowerCase()));
    },
  })
  .query("getMembers", {
    resolve: () => chatMembers,
  })
  .query("getMessages", {
    resolve: () => chatMessages,
  });
