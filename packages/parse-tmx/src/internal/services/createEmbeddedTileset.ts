import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXEmbeddedTilesetParsed } from "#src/models/tmx/parsed/TMXEmbeddedTilesetParsed";

import { AttributeKind } from "#src/internal/models/AttributeKind";
import { readTmxAttributes } from "#src/internal/services/readTmxAttributes";

const embeddedTilesetAttributeKindMap = {
  columns: AttributeKind.RequiredNumber,
  firstgid: AttributeKind.RequiredNumber,
  margin: AttributeKind.Number,
  name: AttributeKind.RequiredString,
  spacing: AttributeKind.Number,
  tilecount: AttributeKind.RequiredNumber,
  tileheight: AttributeKind.RequiredNumber,
  tilewidth: AttributeKind.RequiredNumber,
} as const;

// A tileset written in the document, which is the embedded tileset a tileset file is read as too
export const createEmbeddedTileset = (attributes: TMXAttributes): TMXEmbeddedTilesetParsed => ({
  ...readTmxAttributes(attributes, embeddedTilesetAttributeKindMap),
  tiles: [],
});
