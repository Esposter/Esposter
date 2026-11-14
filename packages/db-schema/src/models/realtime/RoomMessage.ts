import type { LinkPreviewResponse } from "#src/models/message/linkPreview/LinkPreviewResponse";

import { MessageType } from "#src/models/message/MessageType";
import { fileEntitySchema } from "#src/models/streams/FileEntity";
import { z } from "zod";

// One message as its room's object holds it. The id is the room's own integer sequence, which is what a reply, a reaction
// and a thread follow name it by. Dates are ISO strings on the wire, so they are read back into dates
export const roomMessageSchema = z.object({
  appUserId: z.string().nullable(),
  // The webhook identity's image as it was when it sent, empty for every other message
  appUserImage: z.string(),
  createdAt: z.coerce.date(),
  // Set only on the tombstone a delete leaves, which a client keeps by id in place of the message it replaced
  deletedAt: z.coerce.date().nullable(),
  files: z.array(fileEntitySchema),
  id: z.number().int().positive(),
  isEdited: z.boolean(),
  isForward: z.boolean(),
  isPinned: z.boolean(),
  linkPreviewResponse: z.custom<LinkPreviewResponse>().nullable(),
  mentions: z.array(z.string()),
  message: z.string(),
  replyToId: z.number().int().positive().nullable(),
  senderName: z.string().nullable(),
  type: z.enum(MessageType),
  updatedAt: z.coerce.date(),
  userId: z.string().nullable(),
});
export type RoomMessage = z.infer<typeof roomMessageSchema>;
