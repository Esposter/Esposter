import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { AttributeKind } from "#src/models/AttributeKind";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxImage } from "#src/services/createTmxImage";
import { readTmxAttributes } from "#src/services/readTmxAttributes";

const tileAttributeKindMap = {
  id: AttributeKind.RequiredNumber,
  probability: AttributeKind.Number,
  terrain: AttributeKind.String,
  type: AttributeKind.String,
} as const;

// A tileset holds its image, when it has one, and its tiles
export const openTmxTilesetChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Tileset }>,
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
