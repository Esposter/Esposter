import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/internal/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/internal/models/tmx/TMXReadContext";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";

import { TMXTagName } from "#src/internal/models/tmx/TMXTagName";
import { createDataSource } from "#src/internal/services/createDataSource";
import { parseCompression } from "#src/internal/services/parseCompression";
import { parseEncoding } from "#src/internal/services/parseEncoding";

// A layer's data is queued with the cells a finite map gives the layer, and is decoded once the document is read
export const openTileData = (layer: TMXLayerParsed, attributes: TMXAttributes, context: TMXReadContext): TMXFrame => {
  const source = createDataSource(parseCompression(attributes.compression), parseEncoding(attributes.encoding));
  context.pending.push({ expectedCount: context.tileCount, owner: layer, source });
  return { owner: layer, tag: TMXTagName.Data, target: source, text: "" };
};
