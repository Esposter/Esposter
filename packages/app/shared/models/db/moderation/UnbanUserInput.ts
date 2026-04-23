import { selectRoomSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const unbanUserInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userId: selectUserSchema.shape.id,
});
export type UnbanUserInput = z.infer<typeof unbanUserInputSchema>;
