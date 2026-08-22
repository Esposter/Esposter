import { roomIdSchema, selectRoomEmojiInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createRoomEmojiInputSchema = z.object({
  ...roomIdSchema.shape,
  // The id is the one minted with the write SAS, so the row names the blob the client just uploaded
  ...selectRoomEmojiInMessageSchema.pick({ id: true, name: true }).shape,
});
export type CreateRoomEmojiInput = z.infer<typeof createRoomEmojiInputSchema>;
