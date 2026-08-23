import type { EmbedAuthor } from "#src/models/message/webhook/EmbedAuthor";
import type { EmbedField } from "#src/models/message/webhook/EmbedField";
import type { EmbedFooter } from "#src/models/message/webhook/EmbedFooter";

import { embedAuthorSchema } from "#src/models/message/webhook/EmbedAuthor";
import { embedFieldSchema } from "#src/models/message/webhook/EmbedField";
import { embedFooterSchema } from "#src/models/message/webhook/EmbedFooter";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface Embed {
  author?: EmbedAuthor;
  color?: number;
  description?: string;
  fields?: EmbedField[];
  footer?: EmbedFooter;
  image?: { url: string };
  thumbnail?: { url: string };
  timestamp?: string;
  title?: string;
  url?: string;
}

export const embedSchema = z.object({
  author: embedAuthorSchema.optional(),
  // Hex color code as an integer
  color: z
    .number()
    .int()
    .min(0)
    .max(256 ** 3 - 1)
    .optional(),
  description: z.string().max(4096).optional(),
  fields: createUniqueArraySchema(embedFieldSchema, "name").max(25).optional(),
  footer: embedFooterSchema.optional(),
  image: z.object({ url: z.url() }).optional(),
  thumbnail: z.object({ url: z.url() }).optional(),
  timestamp: z.iso.datetime().optional(),
  title: z.string().max(256).optional(),
  url: z.url().optional(),
}) satisfies z.ZodType<Embed>;
