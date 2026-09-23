import type { AttachmentMediaType } from "#src/models/command/AttachmentMediaType";

import { attachmentMediaTypeSchema } from "#src/models/command/AttachmentMediaType";
import { z } from "zod";

export interface Attachment {
  // The text itself for a text file; for an image or a PDF, base64 without the data URL prefix, the shape its
  // Content block carries
  data: string;
  mediaType: AttachmentMediaType;
  name: string;
}

export const attachmentSchema: z.ZodObject<{
  data: z.ZodString;
  mediaType: typeof attachmentMediaTypeSchema;
  name: z.ZodString;
}> = z.object({
  data: z.string(),
  mediaType: attachmentMediaTypeSchema,
  name: z.string(),
}) satisfies z.ZodType<Attachment>;
