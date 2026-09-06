import { roomIdsSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMyUsersToRoomsInputSchema = z.object({
  roomIds: roomIdsSchema.shape.roomIds.min(1),
});
export type ReadMyUsersToRoomsInput = z.infer<typeof readMyUsersToRoomsInputSchema>;
