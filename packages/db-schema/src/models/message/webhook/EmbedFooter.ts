import { z } from "zod";

export const EMBED_FOOTER_TEXT_MAX_LENGTH = 2048;

export interface EmbedFooter {
  icon_url?: string;
  text: string;
}

export const embedFooterSchema = z.object({
  icon_url: z.url().optional(),
  text: z.string().max(EMBED_FOOTER_TEXT_MAX_LENGTH),
}) satisfies z.ZodType<EmbedFooter>;
