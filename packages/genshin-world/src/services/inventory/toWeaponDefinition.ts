import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { ItemCategory } from "genshin-interface";

// A weapon in the bag as the wish grants one: a weapon category entry of one, with no rank of its own, since its tab sorts
// It by level and quality
export const toWeaponDefinition = ({
  id,
  name,
  rarity,
}: Pick<ItemDefinition, "id" | "name" | "rarity">): ItemDefinition => ({
  category: ItemCategory.Weapon,
  id,
  name,
  rank: 0,
  rarity,
  stackLimit: 1,
});
