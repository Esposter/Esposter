import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ORIGINAL_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";

// How many times a recipe can be crafted at `now` from what the bag and the wallet hold: the least of the times each
// Material's count and the Mora allow. Original Resin is paid from the wallet regenerated to `now`, not from the bag
export const computeCraftableCount = (
  recipe: CraftingRecipe,
  { inventory, wallet }: { inventory: Inventory; wallet: Wallet },
  now: Temporal.Instant,
): number => {
  const regeneratedWallet = regenerateOriginalResin(wallet, now);
  const moraCount = recipe.mora === 0 ? Infinity : Math.floor(wallet[Currency.Mora] / recipe.mora);
  return recipe.materials.reduce((count, material) => {
    const heldCount =
      material.id === ORIGINAL_RESIN_ITEM_ID
        ? regeneratedWallet[Currency.OriginalResin]
        : countInventoryItem(inventory.items, material.id);
    return Math.min(count, Math.floor(heldCount / material.count));
  }, moraCount);
};
