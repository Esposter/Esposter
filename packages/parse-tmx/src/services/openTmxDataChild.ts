import type { TMXDataSource } from "#src/models/tmx/TMXDataSource";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxChunk } from "#src/services/createTmxChunk";
import { parseNumberAttribute } from "#src/services/parseNumberAttribute";

type TMXDataParent = Extract<TMXFrame, { tag: TMXTagName.Chunk | TMXTagName.Data }>;

// Infinite maps write a layer's cells as chunks, each with its own queued data in the encoding the layer's data wrote.
// A `<tile>` cell is recorded as its gid, which is the form a data element with no encoding takes.
export const openTmxDataChild = (
  parent: TMXDataParent,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
  context: TMXReadContext,
): TMXFrame | undefined => {
  const source = parent.target;
  switch (tag) {
    case TMXTagName.Tile:
      source.gids.push(parseNumberAttribute(attributes.gid) ?? 0);
      return undefined;
    case TMXTagName.Chunk: {
      if (parent.tag !== TMXTagName.Data) return undefined;
      const chunk = createTmxChunk(attributes);
      parent.owner.chunks ??= [];
      parent.owner.chunks.push(chunk);
      source.chunked = true;
      const chunkSource: TMXDataSource = {
        chunked: false,
        compression: source.compression,
        encoding: source.encoding,
        gids: [],
        text: "",
      };
      context.pending.push({ owner: chunk, source: chunkSource });
      return { tag, target: chunkSource, text: "" };
    }
    default:
      return undefined;
  }
};
