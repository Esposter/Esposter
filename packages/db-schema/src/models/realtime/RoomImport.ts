import { roomMessageSchema } from "#src/models/realtime/RoomMessage";
import { roomReactionSchema } from "#src/models/realtime/RoomReaction";
import { scheduledMessagesInRoom } from "#src/objects/room/schema";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

// A scheduled message still to send, as the copy holds it: its id is a UUIDv7 and its run time an ISO date on the wire
const roomImportScheduledMessageSchema = createSelectSchema(scheduledMessagesInRoom, {
  id: () => z.uuidv7(),
  replyToId: (schema) => schema.positive(),
  runAt: () => z.coerce.date(),
});

// A room's copied history as the cutover sends it to the room's object: every message under the number the cutover gave it,
// The reactions on them, and the scheduled messages still to send. Each row is written under its own number, so a re-run
// Writes the same rows again rather than adding to them
export const roomImportSchema = z.object({
  messages: z.array(roomMessageSchema.omit({ deletedAt: true })),
  reactions: z.array(roomReactionSchema),
  scheduledMessages: z.array(roomImportScheduledMessageSchema),
});
export type RoomImport = z.infer<typeof roomImportSchema>;
