import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const upsertRoomFilterInputSchema = z.object({
  ...roomIdSchema.shape,
  words: z.string().array(),
});
export type UpsertRoomFilterInput = z.infer<typeof upsertRoomFilterInputSchema>;
