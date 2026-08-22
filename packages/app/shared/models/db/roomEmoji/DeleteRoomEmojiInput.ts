import { roomIdSchema, selectRoomEmojiInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteRoomEmojiInputSchema = z.object({
  ...roomIdSchema.shape,
  ...selectRoomEmojiInMessageSchema.pick({ id: true }).shape,
});
export type DeleteRoomEmojiInput = z.infer<typeof deleteRoomEmojiInputSchema>;
