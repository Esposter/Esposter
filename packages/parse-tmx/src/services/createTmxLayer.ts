import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { createTmxGroupLayerShared } from "#src/services/createTmxGroupLayerShared";
import { parseNumberAttribute } from "#src/services/parseNumberAttribute";
import { withoutUndefined } from "#src/services/withoutUndefined";

export const createTmxLayer = (type: string, attributes: TMXAttributes): TMXLayerParsed =>
  withoutUndefined({
    ...createTmxGroupLayerShared(type, attributes),
    color: attributes.color,
    draworder: attributes.draworder,
    height: parseNumberAttribute(attributes.height),
    locked: parseNumberAttribute(attributes.locked),
    width: parseNumberAttribute(attributes.width),
    x: parseNumberAttribute(attributes.x),
    y: parseNumberAttribute(attributes.y),
  });
