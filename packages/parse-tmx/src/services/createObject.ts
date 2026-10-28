import type { TMXObjectParsed } from "#src/models/tmx/parsed/TMXObjectParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { AttributeKind } from "#src/models/AttributeKind";
import { Shape } from "#src/models/Shape";
import { parseFlips } from "#src/services/parseFlips";
import { parseTileId } from "#src/services/parseTileId";
import { readTmxAttributes } from "#src/services/readTmxAttributes";

const objectAttributeKindMap = {
  gid: AttributeKind.Number,
  height: AttributeKind.RequiredNumber,
  id: AttributeKind.RequiredNumber,
  name: AttributeKind.RequiredString,
  rotation: AttributeKind.Number,
  template: AttributeKind.String,
  type: AttributeKind.RequiredString,
  visible: AttributeKind.Number,
  width: AttributeKind.RequiredNumber,
  x: AttributeKind.RequiredNumber,
  y: AttributeKind.RequiredNumber,
} as const;

// A rectangle until a shape child says otherwise. A gid's flip bits are read off it, and its id is the tile without them
export const createObject = (attributes: TMXAttributes): TMXObjectParsed => {
  const { gid, ...object } = readTmxAttributes(attributes, objectAttributeKindMap);
  const shaped: TMXObjectParsed = { ...object, shape: Shape.Rectangle };
  if (gid === undefined) return shaped;
  else return gid ? { ...shaped, flips: parseFlips(gid), gid: parseTileId(gid) } : { ...shaped, gid };
};
