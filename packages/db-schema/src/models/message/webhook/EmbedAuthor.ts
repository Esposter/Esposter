import { z } from "zod";

export interface EmbedAuthor {
  icon_url?: string;
  name: string;
  url?: string;
}

export const embedAuthorSchema: z.ZodType<EmbedAuthor> = z.object({
  icon_url: z.url().optional(),
  name: z.string().max(256),
  url: z.url().optional(),
});
