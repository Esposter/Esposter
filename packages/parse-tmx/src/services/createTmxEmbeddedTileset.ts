import type { TMXEmbeddedTilesetParsed } from "#src/models/tmx/parsed/TMXEmbeddedTilesetParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { parseNumberAttribute } from "#src/services/parseNumberAttribute";
import { withoutUndefined } from "#src/services/withoutUndefined";

export const createTmxEmbeddedTileset = (attributes: TMXAttributes): TMXEmbeddedTilesetParsed =>
  withoutUndefined({
    columns: parseNumberAttribute(attributes.columns) ?? 0,
    firstgid: parseNumberAttribute(attributes.firstgid) ?? 0,
    margin: parseNumberAttribute(attributes.margin),
    name: attributes.name ?? "",
    spacing: parseNumberAttribute(attributes.spacing),
    tilecount: parseNumberAttribute(attributes.tilecount) ?? 0,
    tileheight: parseNumberAttribute(attributes.tileheight) ?? 0,
    tiles: [],
    tilewidth: parseNumberAttribute(attributes.tilewidth) ?? 0,
  });
