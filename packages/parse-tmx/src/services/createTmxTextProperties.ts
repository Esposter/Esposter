import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { parseUntypedValue } from "#src/services/parseUntypedValue";

// A text object's styling is its attributes, which read as properties after the object's own
export const createTmxTextProperties = (attributes: TMXAttributes): TMXPropertiesParsed =>
  Object.entries(attributes).map(([name, value]) => ({ name, value: parseUntypedValue(value) }));
