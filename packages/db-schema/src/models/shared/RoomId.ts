import { selectRoomSchema } from "@/schema/rooms";
import { z } from "zod";

export const roomIdSchema = z.object({
  roomId: selectRoomSchema.shape.id,
});
