import type { TMXObjectParsed } from "#src/models/tmx/parsed/TMXObjectParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { Shape } from "#src/models/Shape";
import { parseFlips } from "#src/services/parseFlips";
import { parseNumberAttribute } from "#src/services/parseNumberAttribute";
import { parseTileId } from "#src/services/parseTileId";
import { withoutUndefined } from "#src/services/withoutUndefined";

// A rectangle until a shape child says otherwise. A gid's flip bits are read off it, and its id is the tile without them
export const createTmxObject = (attributes: TMXAttributes): TMXObjectParsed => {
  const gid = parseNumberAttribute(attributes.gid);
  return withoutUndefined({
    flips: gid ? parseFlips(gid) : undefined,
    gid: gid ? parseTileId(gid) : gid,
    height: parseNumberAttribute(attributes.height) ?? 0,
    id: parseNumberAttribute(attributes.id) ?? 0,
    name: attributes.name ?? "",
    rotation: parseNumberAttribute(attributes.rotation),
    shape: Shape.Rectangle,
    template: attributes.template,
    type: attributes.type ?? "",
    visible: parseNumberAttribute(attributes.visible),
    width: parseNumberAttribute(attributes.width) ?? 0,
    x: parseNumberAttribute(attributes.x) ?? 0,
    y: parseNumberAttribute(attributes.y) ?? 0,
  });
};
