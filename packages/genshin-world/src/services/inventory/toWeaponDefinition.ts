import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { ItemCategory } from "genshin-interface";

// A weapon in the bag as its table holds it: a weapon category entry of one, with no rank of its own, since its tab sorts
// It by level and quality, and carrying the destroy rule and return its table gives
export const toWeaponDefinition = (
  { destroyReturnMaterial, destroyReturnMaterialCount, destroyRule, id, rarity }: WeaponData,
  name: string,
): ItemDefinition => ({
  category: ItemCategory.Weapon,
  destroyReturnMaterial,
  destroyReturnMaterialCount,
  destroyRule,
  id,
  name,
  rank: 0,
  rarity,
  stackLimit: 1,
});
