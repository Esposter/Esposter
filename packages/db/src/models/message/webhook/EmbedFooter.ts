import { z } from "zod";

export interface EmbedFooter {
  icon_url?: string;
  text: string;
}

export const embedFooterSchema: z.ZodType<EmbedFooter> = z.object({
  icon_url: z.url().optional(),
  text: z.string().max(2048),
});
