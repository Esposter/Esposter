import { roomMessageSchema } from "#src/models/realtime/RoomMessage";
import { roomReactionSchema } from "#src/models/realtime/RoomReaction";
import { z } from "zod";

// A room's copied history as the cutover sends it to the room's object: every message under the number the cutover gave it,
// the reactions on them, and the scheduled messages still to send. Each row is written under its own number, so a re-run
// writes the same rows again rather than adding to them
export const roomImportSchema = z.object({
  messages: z.array(roomMessageSchema.omit({ deletedAt: true })),
  reactions: z.array(roomReactionSchema),
  scheduledMessages: z.array(
    z.object({
      id: z.uuidv7(),
      message: z.string(),
      replyToId: z.number().int().positive().nullable(),
      runAt: z.coerce.date(),
      userId: z.string(),
    }),
  ),
});
export type RoomImport = z.infer<typeof roomImportSchema>;
