import type { CharacterAttributes } from "#src/models/character/CharacterAttributes";
import type { Attribute } from "#src/models/character/Attribute";

// A stat as the game sums it: its base raised by its percentage, plus its flat, each read from the attribute total map
export const computeStatTotal = (
  attributeTotalMap: CharacterAttributes["attributeTotalMap"],
  base: Attribute,
  percentage: Attribute,
  flat: Attribute,
): number => attributeTotalMap[base] * (1 + attributeTotalMap[percentage]) + attributeTotalMap[flat];
