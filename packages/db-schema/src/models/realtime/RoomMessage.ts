import type { LinkPreviewResponse } from "#src/models/message/linkPreview/LinkPreviewResponse";

import { MessageType } from "#src/models/message/MessageType";
import { fileEntitySchema } from "#src/models/streams/FileEntity";
import { messagesInRoom } from "#src/objects/room/schema";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

// One message as its room's object holds it. The id is the room's own integer sequence, which is what a reply, a reaction
// And a thread follow name it by. Dates are ISO strings on the wire, so they are read back into dates. A column the room
// Keeps for its own search, or for its webhook's dedupe, is not part of the message a client is sent
export const roomMessageSchema = createSelectSchema(messagesInRoom, {
  createdAt: () => z.coerce.date(),
  deletedAt: () => z.coerce.date(),
  files: () => z.array(fileEntitySchema),
  id: (schema) => schema.positive(),
  linkPreviewResponse: () => z.custom<LinkPreviewResponse>(),
  mentions: () => z.array(z.string()),
  replyToId: (schema) => schema.positive(),
  type: () => z.enum(MessageType),
  updatedAt: () => z.coerce.date(),
}).omit({ filenames: true, webhookDeliveryId: true });
export type RoomMessage = z.infer<typeof roomMessageSchema>;
