import type { Character } from "#src/models/character/Character";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { Wallet } from "#src/models/inventory/Wallet";

import { CHARACTER_EXP_TO_NEXT_LEVEL } from "#src/data/character/characterExpToNext";
import { Currency } from "#src/models/inventory/Currency";
import { CHARACTER_EXP_MATERIALS, CHARACTER_EXP_PER_MORA } from "#src/services/character/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";

// The Character EXP materials a level's EXP is taken from, the largest first, each as many as covers what is left or as
// The bag holds. Undefined when the bag cannot cover it all, and otherwise the EXP taken, which may overshoot the level
const getExpMaterialPlan = (expNeeded: number, items: readonly InventoryItem[]) => {
  const takes: ItemCount[] = [];
  let remaining = expNeeded;
  for (const { exp, id } of CHARACTER_EXP_MATERIALS) {
    if (remaining <= 0) break;
    const count = Math.min(countInventoryItem(items, id), Math.ceil(remaining / exp));
    if (count > 0) takes.push({ count, id });
    remaining -= count * exp;
  }
  return remaining > 0 ? undefined : { exp: expNeeded - remaining, takes };
};

// A character raised one level with the Character EXP materials that level needs, the bag's items taken and the Mora the
// EXP costs. Undefined where the level is at its cap or past the table, or the bag or the wallet cannot cover it, and
// Then nothing is taken
export const levelUpCharacter = (
  character: Character,
  { inventory, maxLevel, wallet }: { inventory: Inventory; maxLevel: number; wallet: Wallet },
): { character: Character; inventory: Inventory; wallet: Wallet } | undefined => {
  const expNeeded = CHARACTER_EXP_TO_NEXT_LEVEL[character.level - 1];
  if (character.level >= maxLevel || expNeeded === undefined) return undefined;
  const plan = getExpMaterialPlan(expNeeded, inventory.items);
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
