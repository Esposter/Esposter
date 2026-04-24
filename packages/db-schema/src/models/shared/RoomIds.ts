import { selectRoomSchema } from "@/schema/rooms";
import { z } from "zod";

export const roomIdsSchema = z.object({
  roomIds: selectRoomSchema.shape.id.array(),
});
