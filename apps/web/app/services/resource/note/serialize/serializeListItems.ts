import type { NodesSerializer } from "@/models/resource/note/serialize/NodesSerializer";
import type { JSONContent } from "@tiptap/core";

import { prefixLines } from "@/services/resource/note/serialize/prefixLines";

export const serializeListItems = (
  items: JSONContent[],
  getMarker: (item: JSONContent, index: number) => string,
  serializeBlocks: NodesSerializer,
) =>
  items
    .map((item, index) => {
      const marker = getMarker(item, index);
      return prefixLines(serializeBlocks(item.content ?? []), marker, " ".repeat(marker.length));
    })
    .join("\n");
