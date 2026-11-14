import type { LinkPreviewResponse } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";
import { z } from "zod";

// The legacy message as Azure holds it, read field by field. A file keeps every property it was written with, since its room object
// stores the file whole. A reply names its root by the root's row key, which the import turns into the root's number in the room
export const legacyMessageSchema = z.object({
  appUser: z.looseObject({ id: z.string(), image: z.string().optional(), name: z.string().optional() }).optional(),
  files: z.array(z.looseObject({ filename: z.string(), id: z.string() })).optional(),
  isEdited: z.boolean().optional(),
  isForward: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  linkPreviewResponse: z.custom<LinkPreviewResponse>().nullish(),
  mentions: z.array(z.string()).optional(),
  message: z.string().optional(),
  partitionKey: z.string(),
  replyRowKey: z.string().optional(),
  rowKey: z.string(),
  type: z.enum(MessageType),
  userId: z.string().optional(),
});
export type LegacyMessage = z.infer<typeof legacyMessageSchema>;
