import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXObjectParsed } from "#src/models/tmx/parsed/TMXObjectParsed";

import { AttributeKind } from "#src/internal/models/AttributeKind";
import { parseFlips } from "#src/internal/services/parseFlips";
import { parseTileId } from "#src/internal/services/parseTileId";
import { readTmxAttributes } from "#src/internal/services/readTmxAttributes";
import { Shape } from "#src/models/Shape";

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

// A rectangle until a shape child says otherwise. A gid's flip bits are read off it, and its id is the tile without
// Them
export const createObject = (attributes: TMXAttributes): TMXObjectParsed => {
  const { gid, ...object } = readTmxAttributes(attributes, objectAttributeKindMap);
  const shaped: TMXObjectParsed = { ...object, shape: Shape.Rectangle };
  if (gid === undefined) return shaped;
  else return gid ? { ...shaped, flips: parseFlips(gid), gid: parseTileId(gid) } : { ...shaped, gid };
};
