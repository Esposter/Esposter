import type { TMXGroupLayerParsed } from "#src/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxGroupLayerShared } from "#src/services/createTmxGroupLayerShared";

export const createTmxGroup = (attributes: TMXAttributes): TMXGroupLayerParsed => ({
  ...createTmxGroupLayerShared(TMXTagName.Group, attributes),
  layers: [],
});
