import type { JSONContent } from "@tiptap/core";

import { serializeInlineNode } from "#shared/services/resource/note/serialize/serializeInlineNode";

export const serializeInline = (nodes: JSONContent[]): string =>
  nodes.map((node) => serializeInlineNode(node, serializeInline)).join("");
