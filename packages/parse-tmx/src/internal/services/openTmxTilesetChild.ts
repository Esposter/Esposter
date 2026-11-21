import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/internal/models/tmx/TMXFrame";

import { AttributeKind } from "#src/internal/models/AttributeKind";
import { TMXTagName } from "#src/internal/models/tmx/TMXTagName";
import { createTmxImage } from "#src/internal/services/createTmxImage";
import { readTmxAttributes } from "#src/internal/services/readTmxAttributes";

const tileAttributeKindMap = {
  id: AttributeKind.RequiredNumber,
  probability: AttributeKind.Number,
  terrain: AttributeKind.String,
  type: AttributeKind.String,
} as const;

// A tileset holds its image, when it has one, and its tiles
export const openTmxTilesetChild = (
  parent: Extract<TMXFrame, { tag: typeof TMXTagName.Tileset }>,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  const tileset = parent.target;
  switch (tag) {
    case TMXTagName.Image: {
      const image = createTmxImage(attributes);
      tileset.image = image;
      return { tag, target: image, text: "" };
    }
    case TMXTagName.Tile: {
      const tile = readTmxAttributes(attributes, tileAttributeKindMap);
      tileset.tiles.push(tile);
      return { tag, target: tile, text: "" };
    }
    default:
      return undefined;
  }
};
