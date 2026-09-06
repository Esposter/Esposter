import { createNameSchema } from "#src/models/shared/Name";
import { z } from "zod";

export const EMBED_AUTHOR_NAME_MAX_LENGTH = 256;

export interface EmbedAuthor {
  icon_url?: string;
  name: string;
  url?: string;
}

export const embedAuthorSchema = z.object({
  icon_url: z.url().optional(),
  name: createNameSchema(EMBED_AUTHOR_NAME_MAX_LENGTH),
  url: z.url().optional(),
}) satisfies z.ZodType<EmbedAuthor>;
