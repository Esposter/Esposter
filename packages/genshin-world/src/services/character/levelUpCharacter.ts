import type { Character } from "#src/models/character/Character";
import type { ExpMaterial } from "#src/models/inventory/ExpMaterial";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { CHARACTER_EXP_PER_MORA } from "#src/services/character/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";

// The Character EXP materials a level's EXP is taken from, the largest first, each as many as covers what is left or as
// The bag holds. Undefined when the bag cannot cover it all, and otherwise the EXP taken, which may overshoot the level
const getExpMaterialPlan = (expNeeded: number, items: InventoryItem[], expMaterials: readonly ExpMaterial[]) => {
  const takes: ItemCount[] = [];
  let remaining = expNeeded;
  for (const { experience, id } of expMaterials) {
    if (remaining <= 0) break;
    const count = Math.min(countInventoryItem(items, id), Math.ceil(remaining / experience));
    if (count > 0) takes.push({ count, id });
    remaining -= count * experience;
  }
  return remaining > 0 ? undefined : { exp: expNeeded - remaining, takes };
};

// A character raised one level with the Character EXP materials that level needs, the bag's items taken and the Mora the
// EXP costs. Undefined where the level is at its cap or past the table, or the bag or the wallet cannot cover it, and
// Then nothing is taken
export const levelUpCharacter = (
  character: Character,
  {
    expMaterials,
    expToNext,
    inventory,
    maxLevel,
    wallet,
  }: {
    expMaterials: readonly ExpMaterial[];
    expToNext: readonly number[];
    inventory: Inventory;
    maxLevel: number;
    wallet: Wallet;
  },
): { character: Character; inventory: Inventory; wallet: Wallet } | undefined => {
  const expNeeded = expToNext[character.level - 1];
  if (character.level >= maxLevel || expNeeded === undefined) return undefined;
  const plan = getExpMaterialPlan(expNeeded, inventory.items, expMaterials);
  if (!plan) return undefined;
  const mora = plan.exp / CHARACTER_EXP_PER_MORA;
  if (wallet[Currency.Mora] < mora) return undefined;
  return {
    character: { ...character, level: character.level + 1 },
    inventory: {
      ...inventory,
      items: plan.takes.reduce((items, { count, id }) => takeInventoryItems(items, id, count), inventory.items),
    },
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] - mora },
  };
};
