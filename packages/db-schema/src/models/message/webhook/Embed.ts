import type { EmbedAuthor } from "#src/models/message/webhook/EmbedAuthor";
import type { EmbedField } from "#src/models/message/webhook/EmbedField";
import type { EmbedFooter } from "#src/models/message/webhook/EmbedFooter";

import { embedAuthorSchema } from "#src/models/message/webhook/EmbedAuthor";
import { embedFieldSchema } from "#src/models/message/webhook/EmbedField";
import { embedFooterSchema } from "#src/models/message/webhook/EmbedFooter";
import {
  EMBED_COLOR_MAX_VALUE,
  EMBED_DESCRIPTION_MAX_LENGTH,
  EMBED_FIELDS_MAX_LENGTH,
  EMBED_TITLE_MAX_LENGTH,
} from "#src/services/message/webhook/constants";
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
  color: z.int().min(0).max(EMBED_COLOR_MAX_VALUE).optional(),
  description: z.string().max(EMBED_DESCRIPTION_MAX_LENGTH).optional(),
  fields: createUniqueArraySchema(embedFieldSchema, "name").max(EMBED_FIELDS_MAX_LENGTH).optional(),
  footer: embedFooterSchema.optional(),
  image: z.object({ url: z.url() }).optional(),
  thumbnail: z.object({ url: z.url() }).optional(),
  timestamp: z.iso.datetime().optional(),
  title: z.string().max(EMBED_TITLE_MAX_LENGTH).optional(),
  url: z.url().optional(),
}) satisfies z.ZodType<Embed>;
