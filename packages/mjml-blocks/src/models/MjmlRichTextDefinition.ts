import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { z } from "zod";

// The consumer's rich text: its content's schema, and the functions that read and write its HTML
export interface MjmlRichTextDefinition<TContent extends MjmlRichText = MjmlRichText> {
  parseHtml: (html: string) => TContent;
  renderHtml: (content: TContent) => string;
  schema: z.ZodType<TContent>;
}
