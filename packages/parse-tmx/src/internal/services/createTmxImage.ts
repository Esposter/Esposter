import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXImageParsed } from "#src/models/tmx/parsed/TMXImageParsed";

import { AttributeKind } from "#src/internal/models/AttributeKind";
import { readTmxAttributes } from "#src/internal/services/readTmxAttributes";

const imageAttributeKindMap = {
  format: AttributeKind.String,
  height: AttributeKind.RequiredNumber,
  source: AttributeKind.RequiredString,
  trans: AttributeKind.String,
  width: AttributeKind.RequiredNumber,
} as const;

// The image an element carries, whether a layer, a tileset or a tile holds it
export const createTmxImage = (attributes: TMXAttributes): TMXImageParsed =>
  readTmxAttributes(attributes, imageAttributeKindMap);
