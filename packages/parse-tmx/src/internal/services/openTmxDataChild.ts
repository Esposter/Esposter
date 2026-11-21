import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/internal/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/internal/models/tmx/TMXReadContext";

import { AttributeKind } from "#src/internal/models/AttributeKind";
import { TMXTagName } from "#src/internal/models/tmx/TMXTagName";
import { createDataSource } from "#src/internal/services/createDataSource";
import { readTmxAttributes } from "#src/internal/services/readTmxAttributes";

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
  parent: Extract<TMXFrame, { tag: typeof TMXTagName.Chunk | typeof TMXTagName.Data }>,
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
      context.pending.push({ expectedCount: chunk.width * chunk.height, owner: chunk, source: chunkSource });
      return { tag, target: chunkSource, text: "" };
    }
    case TMXTagName.Tile:
      source.gids.push(readTmxAttributes(attributes, gidAttributeKindMap).gid);
      return undefined;
    default:
      return undefined;
  }
};
