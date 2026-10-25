import type { JSONContent } from "@tiptap/core";

import { serializeBlock } from "@/services/resource/note/serialize/serializeBlock";

export const serializeBlocks = (nodes: JSONContent[]): string =>
  nodes
    .map((node) => serializeBlock(node, serializeBlocks))
    .filter(Boolean)
    .join("\n\n");
