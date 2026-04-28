import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateRoomFilterInputSchema = z.object({
  ...roomIdSchema.shape,
  words: z.string().array(),
});
export type UpdateRoomFilterInput = z.infer<typeof updateRoomFilterInputSchema>;
