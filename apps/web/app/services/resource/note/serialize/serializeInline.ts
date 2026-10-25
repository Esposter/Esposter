import type { JSONContent } from "@tiptap/core";

import { serializeInlineNode } from "@/services/resource/note/serialize/serializeInlineNode";

export const serializeInline = (nodes: JSONContent[]): string =>
  nodes.map((node) => serializeInlineNode(node, serializeInline)).join("");
