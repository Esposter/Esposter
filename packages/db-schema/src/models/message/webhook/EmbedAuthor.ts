import { createNameSchema } from "#src/models/shared/Name";
import { EMBED_AUTHOR_NAME_MAX_LENGTH } from "#src/services/message/webhook/constants";
import { z } from "zod";

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
