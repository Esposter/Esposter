import type { MjmlRichTextAttributeValue } from "#src/models/MjmlRichTextAttributeValue";

// The structural shape of a rich text document as MJML's text components read it: a tree of typed nodes, each with attributes, marks and text.
// Its optional keys match tiptap's `JSONContent` key for key, so a note document is one and one is a note document
export interface MjmlRichText {
  attrs?: Record<string, MjmlRichTextAttributeValue> | undefined;
  content?: MjmlRichText[];
  marks?: { attrs?: Record<string, MjmlRichTextAttributeValue>; type: string }[];
  text?: string;
  type?: string;
}
