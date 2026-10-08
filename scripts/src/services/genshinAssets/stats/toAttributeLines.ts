import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";
import type { AttributeLine } from "genshin-world";

import { EMPTY_PROPERTY_TYPE } from "#src/services/genshinAssets/stats/constants";
import { Attributes } from "genshin-world";

// A table's properties as attribute lines, an empty slot and a line of none left out; a property no attribute names is
// Left out too and noted, since the run's output then lacks it
export const toAttributeLines = (properties: readonly ExcelProperty[], notes: string[]): AttributeLine[] =>
  properties.flatMap(({ propType, value = 0 }) => {
    if (propType === EMPTY_PROPERTY_TYPE || value === 0) return [];
    const attribute = Attributes.find((knownAttribute) => knownAttribute === propType);
    if (!attribute) {
      notes.push(`${propType} names no attribute; its line is left out`);
      return [];
    }
    return [{ attribute, value }];
  });
