import type { WeaponIconPlan } from "#src/models/genshinAssets/weapons/WeaponIconPlan";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { getOrCreate } from "@esposter/shared";

// Each distinct icon name the weapon table holds, placed in the first index block holding its texture. A name the index
// Holds no texture for is reported in place of being left out, and an icon two rows share is planned once
export const getWeaponIconPlan = (iconNames: readonly string[], assets: readonly IndexedAsset[]): WeaponIconPlan => {
  const nameBlockMap = new Map<string, string>();
  for (const { block, name } of assets) if (!nameBlockMap.has(name)) nameBlockMap.set(name, block);
  const blockNamesMap = new Map<string, string[]>();
  const missingNames: string[] = [];
  for (const name of new Set(iconNames)) {
    const block = nameBlockMap.get(name);
    if (block) getOrCreate(blockNamesMap, block, () => []).push(name);
    else missingNames.push(name);
  }
  return { blockNamesMap, missingNames };
};
