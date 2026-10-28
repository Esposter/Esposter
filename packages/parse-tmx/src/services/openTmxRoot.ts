import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

import { AttributeKind } from "#src/models/AttributeKind";
import { TMXMapParsed } from "#src/models/tmx/parsed/TMXMapParsed";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createEmbeddedTileset } from "#src/services/createEmbeddedTileset";
import { parseTmxTagName } from "#src/services/parseTmxTagName";
import { readTmxAttributes } from "#src/services/readTmxAttributes";
import { InvalidOperationError, Operation } from "@esposter/shared";

const mapAttributeKindMap = {
  backgroundcolor: AttributeKind.String,
  compressionlevel: AttributeKind.Number,
  height: AttributeKind.RequiredNumber,
  hexsidelength: AttributeKind.Number,
  infinite: AttributeKind.RequiredNumber,
  nextlayerid: AttributeKind.RequiredNumber,
  nextobjectid: AttributeKind.RequiredNumber,
  orientation: AttributeKind.RequiredString,
  parallaxoriginx: AttributeKind.Number,
  parallaxoriginy: AttributeKind.Number,
  renderorder: AttributeKind.RequiredString,
  staggeraxis: AttributeKind.String,
  staggerindex: AttributeKind.String,
  tiledversion: AttributeKind.RequiredString,
  tileheight: AttributeKind.RequiredNumber,
  tilewidth: AttributeKind.RequiredNumber,
  version: AttributeKind.RequiredNumber,
  width: AttributeKind.RequiredNumber,
} as const;

// A document's root is a map, or a tileset on its own. An external tileset has no children to read, so it has no frame.
export const openTmxRoot = (name: string, attributes: TMXAttributes, context: TMXReadContext): TMXFrame | undefined => {
  const tag = parseTmxTagName(name);
  switch (tag) {
    case TMXTagName.Map: {
      const map = Object.assign(new TMXMapParsed(), readTmxAttributes(attributes, mapAttributeKindMap));
      context.tileCount = map.width * map.height;
      return { tag, target: map, text: "" };
    }
    case TMXTagName.Tileset:
      if (attributes.source === undefined) return { tag, target: createEmbeddedTileset(attributes), text: "" };
      else return undefined;
    default:
      throw new InvalidOperationError(Operation.Read, openTmxRoot.name, `${name} is not a map or a tileset`);
  }
};
