import type { TMXTileParsed } from "#src/models/tmx/parsed/TMXTileParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { parseNumberAttribute } from "#src/services/parseNumberAttribute";
import { withoutUndefined } from "#src/services/withoutUndefined";

export const createTmxTile = (attributes: TMXAttributes): TMXTileParsed =>
  withoutUndefined({
    id: parseNumberAttribute(attributes.id) ?? 0,
    probability: parseNumberAttribute(attributes.probability),
    terrain: attributes.terrain,
    type: attributes.type,
  });
