import type { TMXChunkParsed } from "#src/models/tmx/parsed/TMXChunkParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { parseNumberAttribute } from "#src/services/parseNumberAttribute";

export const createTmxChunk = (attributes: TMXAttributes): TMXChunkParsed => ({
  height: parseNumberAttribute(attributes.height) ?? 0,
  width: parseNumberAttribute(attributes.width) ?? 0,
  x: parseNumberAttribute(attributes.x) ?? 0,
  y: parseNumberAttribute(attributes.y) ?? 0,
});
