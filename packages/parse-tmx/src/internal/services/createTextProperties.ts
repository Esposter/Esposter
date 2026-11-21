import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";

import { parseUntypedValue } from "#src/internal/services/parseUntypedValue";

// A text object's styling is its attributes, which read as properties after the object's own
export const createTextProperties = (attributes: TMXAttributes): TMXPropertiesParsed =>
  Object.entries(attributes).map(([name, value]) => ({ name, value: parseUntypedValue(value) }));
