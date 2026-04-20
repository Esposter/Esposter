import { createNameSchema } from "@/services/zod";
import { z } from "zod";

export interface EmbedField {
  inline?: boolean;
  name: string;
  value: string;
}

export const embedFieldSchema = z.object({
  inline: z.boolean().optional(),
  name: createNameSchema(256),
  value: z.string().min(1).max(1024),
}) satisfies z.ZodType<EmbedField>;
