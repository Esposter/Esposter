import type { Attribute } from "#src/models/character/Attribute";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { getGrownAttributeLines } from "#src/services/character/getGrownAttributeLines";

// A weapon's attribute totals at a level in an ascension phase: each line of its growth curve and of the phase summed as
// The character's weapon panel and the Weapon screen both sum them
export const getWeaponAttributeTotals = (
  weaponData: WeaponData,
  weaponGrowCurveMap: ReadonlyMap<string, readonly number[]>,
  level: number,
  ascension: number,
): Record<Attribute, number> =>
  computeCharacterAttributes(getGrownAttributeLines(weaponData, weaponGrowCurveMap, level, ascension))
    .attributeTotalMap;
