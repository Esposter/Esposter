import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

import { AttributeKind } from "#src/models/AttributeKind";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createDataSource } from "#src/services/createDataSource";
import { readTmxAttributes } from "#src/services/readTmxAttributes";

const gidAttributeKindMap = { gid: AttributeKind.RequiredNumber } as const;
const chunkAttributeKindMap = {
  height: AttributeKind.RequiredNumber,
  width: AttributeKind.RequiredNumber,
  x: AttributeKind.RequiredNumber,
  y: AttributeKind.RequiredNumber,
} as const;

// Infinite maps write a layer's cells as chunks, each with its own queued data in the encoding the layer's data wrote.
// A `<tile>` cell is recorded as its gid, which is the form a data element with no encoding takes.
export const openTmxDataChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Chunk | TMXTagName.Data }>,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
  context: TMXReadContext,
): TMXFrame | undefined => {
  const source = parent.target;
  switch (tag) {
    case TMXTagName.Chunk: {
      if (parent.tag !== TMXTagName.Data) return undefined;
      const chunk = readTmxAttributes(attributes, chunkAttributeKindMap);
      parent.owner.chunks ??= [];
      parent.owner.chunks.push(chunk);
      source.chunked = true;
      const chunkSource = createDataSource(source.compression, source.encoding);
      context.pending.push({ owner: chunk, source: chunkSource });
      return { tag, target: chunkSource, text: "" };
    }
    case TMXTagName.Tile:
      source.gids.push(readTmxAttributes(attributes, gidAttributeKindMap).gid);
      return undefined;
    default:
      return undefined;
  }
};
