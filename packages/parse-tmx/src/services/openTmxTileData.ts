import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXDataSource } from "#src/models/tmx/TMXDataSource";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { parseCompression } from "#src/services/parseCompression";
import { parseEncoding } from "#src/services/parseEncoding";

// A layer's data is queued with the cells a finite map gives the layer, and is decoded once the document is read
export const openTmxTileData = (
  layer: TMXLayerParsed,
  attributes: TMXAttributes,
  context: TMXReadContext,
): TMXFrame => {
  const source: TMXDataSource = {
    chunked: false,
    compression: parseCompression(attributes.compression),
    encoding: parseEncoding(attributes.encoding),
    gids: [],
    text: "",
  };
  context.pending.push({ expectedCount: context.tileCount, owner: layer, source });
  return { owner: layer, tag: TMXTagName.Data, target: source, text: "" };
};
