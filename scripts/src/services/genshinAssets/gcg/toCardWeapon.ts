import type { ExcelGcgCardRow } from "#src/models/genshinAssets/gcg/ExcelGcgCardRow";

import { findTagSuffix } from "#src/services/genshinAssets/gcg/findTagSuffix";

// A weapon card names its weapon kind, the tag's suffix as a character's weapon is named, and any other card names none
export const toCardWeapon = ({ tagList }: ExcelGcgCardRow): { weapon?: string } => {
  const weapon = findTagSuffix(tagList, "GCG_TAG_WEAPON_");
  return weapon === undefined ? {} : { weapon };
};
