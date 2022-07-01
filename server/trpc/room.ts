import chatRooms from "@/assets/data/chatRooms.json";
import chatMembers from "@/assets/data/chatMembers.json";
import chatMessages from "@/assets/data/chatMessages.json";
import { createRouter } from "@/server/trpc/createRouter";

export const roomRouter = createRouter()
  .query("getRooms", {
    resolve: () => chatRooms,
  })
  .query("getMembers", {
    resolve: () => chatMembers,
  })
  .query("getMessages", {
    resolve: () => chatMessages,
  });
