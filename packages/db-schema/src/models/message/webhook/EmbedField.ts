import { createNameSchema } from "#src/models/shared/Name";
import { EMBED_FIELD_NAME_MAX_LENGTH, EMBED_FIELD_VALUE_MAX_LENGTH } from "#src/services/message/webhook/constants";
import { z } from "zod";

export interface EmbedField {
  inline?: boolean;
  name: string;
  value: string;
}

export const embedFieldSchema = z.object({
  inline: z.boolean().optional(),
  name: createNameSchema(EMBED_FIELD_NAME_MAX_LENGTH),
  value: z.string().min(1).max(EMBED_FIELD_VALUE_MAX_LENGTH),
}) satisfies z.ZodType<EmbedField>;
