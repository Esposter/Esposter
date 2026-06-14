import { selectRoomInMessageSchema } from "@/schema/roomsInMessage";
import { z } from "zod";

export const roomIdSchema = z.object({
  roomId: selectRoomInMessageSchema.shape.id,
});
