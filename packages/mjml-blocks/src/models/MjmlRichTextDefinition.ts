import type { z } from "zod";

// The consumer's rich text: its content's schema, and the functions that read and write its HTML
export interface MjmlRichTextDefinition<TContent = unknown> {
  parseHtml: (html: string) => TContent;
  renderHtml: (content: TContent) => string;
  schema: z.ZodType<TContent>;
}
