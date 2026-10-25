import type { JSONContent } from "@tiptap/core";

import { createParagraph } from "#shared/services/resource/note/deserialize/createParagraph";

// A container the kit requires a paragraph in starts with one, so a list item that opens on a nested list still has
// the paragraph its schema asks for
export const withLeadingParagraph = (nodes: JSONContent[]): JSONContent[] =>
  nodes[0]?.type === "paragraph" ? nodes : [createParagraph([]), ...nodes];
