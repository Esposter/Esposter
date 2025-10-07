import { z } from "zod";

export interface EmbedField {
  inline?: boolean;
  name: string;
  value: string;
}

export const embedFieldSchema: z.ZodType<EmbedField> = z.object({
  inline: z.boolean().optional(),
  name: z.string().min(1).max(256),
  value: z.string().min(1).max(1024),
});
