import chatRooms from "@/assets/data/chatRooms.json";
import { createRouter } from "@/server/trpc/createRouter";

export const roomRouter = createRouter().query("getRooms", {
  resolve: () => chatRooms,
});
