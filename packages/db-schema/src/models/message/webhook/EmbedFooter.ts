import { EMBED_FOOTER_TEXT_MAX_LENGTH } from "#src/services/message/webhook/constants";
import { z } from "zod";

export interface EmbedFooter {
  icon_url?: string;
  text: string;
}

export const embedFooterSchema = z.object({
  icon_url: z.url().optional(),
  text: z.string().max(EMBED_FOOTER_TEXT_MAX_LENGTH),
}) satisfies z.ZodType<EmbedFooter>;
