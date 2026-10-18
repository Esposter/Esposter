import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { DishUse } from "#src/models/cooking/DishUse";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryEntryUse } from "#src/models/inventory/InventoryEntryUse";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { eatDish } from "#src/services/cooking/eatDish";
import { learnCookingRecipe } from "#src/services/cooking/learnCookingRecipe";
import { FRAGILE_RESIN_ITEM_ID } from "#src/services/originalResin/constants";
import { refillOriginalResinWithFragileResin } from "#src/services/originalResin/refillOriginalResinWithFragileResin";
import { ItemCategory } from "genshin-interface";

// The bag, wallet and cooking progress after one of its entries is used, routed by the entry's kind: a food is eaten through
// Its dish's use by the Character on the field, Fragile Resin is routed by its id, since the published material table does not
// Yet carry the item, and an instruction is routed by the dish it teaches. Undefined, with nothing changed, where the bag holds
// No such entry or its kind has no use yet
export const useInventoryEntry = (
  inventory: Inventory,
  entryId: number,
  {
    cookingProgress,
    dishUseMap,
    eaterId,
    getMaxHealth,
    instructionRecipeMap,
    kitEffectState,
    now,
    party,
    wallet,
  }: {
    cookingProgress: CookingProgress;
    dishUseMap: ReadonlyMap<number, DishUse>;
    eaterId: number;
    getMaxHealth: (characterId: number) => number;
    instructionRecipeMap: ReadonlyMap<number, CookingRecipe>;
    kitEffectState: KitEffectState;
    now: Temporal.Instant;
    party: Party;
    wallet: Wallet;
  },
): InventoryEntryUse | undefined => {
  const item = inventory.items.find(({ id }) => id === entryId);
  if (item === undefined) return undefined;
  if (item.definition.id === FRAGILE_RESIN_ITEM_ID) return refillOriginalResinWithFragileResin(inventory, wallet, now);
  const instructionRecipe = instructionRecipeMap.get(item.definition.id);
  if (instructionRecipe !== undefined) {
    const learned = learnCookingRecipe(instructionRecipe, item.definition.id, { inventory, progress: cookingProgress });
    return learned === undefined ? undefined : { cookingProgress: learned.progress, inventory: learned.inventory };
  }
  switch (item.definition.category) {
    case ItemCategory.Food: {
      const dishUse = dishUseMap.get(item.definition.id);
      if (dishUse === undefined) return undefined;
      const eatenInventory = eatDish(inventory, item.definition.id, dishUse, {
        eaterId,
        getMaxHealth,
        kitEffectState,
        party,
      });
      return eatenInventory === undefined ? undefined : { inventory: eatenInventory };
    }
    default:
      return undefined;
  }
};
