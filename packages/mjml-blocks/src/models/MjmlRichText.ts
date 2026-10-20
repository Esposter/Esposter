import type { MjmlRichTextAttributeValue } from "#src/models/MjmlRichTextAttributeValue";

// The structural shape of a rich text document as MJML's text components read it: a tree of typed nodes, each with attributes, marks and text
export interface MjmlRichText {
  attrs?: Record<string, MjmlRichTextAttributeValue>;
  content?: MjmlRichText[];
  marks?: { attrs?: Record<string, MjmlRichTextAttributeValue>; type: string }[];
  text?: string;
  type?: string;
}
