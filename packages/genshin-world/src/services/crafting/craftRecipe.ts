import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { checkIsRecipeOpen } from "#src/services/crafting/checkIsRecipeOpen";
import { computeCraftableCount } from "#src/services/crafting/computeCraftableCount";
import { ORIGINAL_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { spendOriginalResin } from "#src/services/originalResin/spendOriginalResin";

// The bag and wallet after `count` times a recipe is crafted at `now` by a player of this Adventure Rank: its Original
// Resin spent from the wallet, its other materials taken from the bag, its Mora paid, and its results put in the bag.
// Undefined, with nothing spent, where the recipe is not open, the count is more than its materials pay for, or the bag
// Has no room for every result
export const craftRecipe = (
  recipe: CraftingRecipe,
  count: number,
  resultDefinition: ItemDefinition,
  {
    adventureRank,
    inventory,
    now,
    progress,
    wallet,
  }: { adventureRank: number; inventory: Inventory; now: Temporal.Instant; progress: CraftingProgress; wallet: Wallet },
): undefined | { inventory: Inventory; wallet: Wallet } => {
  if (
    !checkIsRecipeOpen(recipe, progress, adventureRank) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > computeCraftableCount(recipe, { inventory, wallet }, now)
  )
    return undefined;
  const resinCount = recipe.materials.find(({ id }) => id === ORIGINAL_RESIN_ITEM_ID)?.count ?? 0;
  const spentWallet = spendOriginalResin(wallet, resinCount * count, now);
  if (!spentWallet) return undefined;
  const items = recipe.materials
    .filter(({ id }) => id !== ORIGINAL_RESIN_ITEM_ID)
    .reduce((bagItems, material) => takeInventoryItems(bagItems, material.id, material.count * count), inventory.items);
  const addition = addInventoryItem({ items, nextId: inventory.nextId }, resultDefinition, recipe.resultCount * count);
  if (addition.overflow > 0) return undefined;
  return {
    inventory: addition.inventory,
    wallet: { ...spentWallet, [Currency.Mora]: spentWallet[Currency.Mora] - recipe.mora * count },
  };
};
