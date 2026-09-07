import { roomIdSchema, selectRoomEmojiInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

// A rename is the only update an emoji has: the image is the blob its id names, so replacing it is a delete
// And an upload rather than an edit
export const updateRoomEmojiInputSchema = z.object({
  ...roomIdSchema.shape,
  ...selectRoomEmojiInMessageSchema.pick({ id: true, name: true }).shape,
});
export type UpdateRoomEmojiInput = z.infer<typeof updateRoomEmojiInputSchema>;
