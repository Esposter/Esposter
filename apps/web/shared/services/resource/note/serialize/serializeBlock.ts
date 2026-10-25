import type { NodesSerializer } from "#shared/models/resource/note/serialize/NodesSerializer";
import type { JSONContent } from "@tiptap/core";

import { BlockSerializerMap } from "#shared/services/resource/note/serialize/BlockSerializerMap";
import { serializeParagraph } from "#shared/services/resource/note/serialize/serializeParagraph";

export const serializeBlock = (node: JSONContent, serializeBlocks: NodesSerializer): string => {
  const serializer = BlockSerializerMap[node.type ?? ""];
  if (serializer) return serializer(node, serializeBlocks);

  return node.text === undefined ? serializeBlocks(node.content ?? []) : serializeParagraph({ content: [node] });
};
