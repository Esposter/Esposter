import type { Element } from "genshin-world";

import { GcgCostTableElementMap } from "#src/services/genshinAssets/gcg/constants";
import { invalidRead } from "#src/services/genshinAssets/gcg/invalidRead";

// The element a cost type or a character tag names, the tag spelt as its cost type
export const toElement = (costType: string, rowId?: number): Element => {
  const element = GcgCostTableElementMap.get(costType);
  if (!element) throw invalidRead(`row ${rowId ?? costType} names no element for ${costType}`);
  return element;
};
