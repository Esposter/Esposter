import type { DishUse } from "#src/models/cooking/DishUse";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryEntryUse } from "#src/models/inventory/InventoryEntryUse";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { eatDish } from "#src/services/cooking/eatDish";
import { checkIsFragileResin } from "#src/services/inventory/checkIsFragileResin";
import { refillOriginalResinWithFragileResin } from "#src/services/originalResin/refillOriginalResinWithFragileResin";
import { ItemCategory } from "genshin-interface";

// The bag and wallet after one of its entries is used, routed by the entry's kind: a food is eaten through its dish's use
// By the Character on the field, and Fragile Resin by its id. Undefined, with nothing changed, where the bag holds no such
// Entry or its kind has no use yet
export const useInventoryEntry = (
  inventory: Inventory,
  entryId: number,
  {
    dishUseMap,
    eaterId,
    getMaxHealth,
    kitEffectState,
    now,
    party,
    wallet,
  }: {
    dishUseMap: ReadonlyMap<number, DishUse>;
    eaterId: number;
    getMaxHealth: (characterId: number) => number;
    kitEffectState: KitEffectState;
    now: Temporal.Instant;
    party: Party;
    wallet: Wallet;
  },
): InventoryEntryUse | undefined => {
  const item = inventory.items.find(({ id }) => id === entryId);
  if (item === undefined) return undefined;
  if (checkIsFragileResin(item)) return refillOriginalResinWithFragileResin(inventory, wallet, now);
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
