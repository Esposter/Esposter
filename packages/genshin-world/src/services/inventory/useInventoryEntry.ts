import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryEntryUse } from "#src/models/inventory/InventoryEntryUse";
import type { InventoryUseContext } from "#src/models/inventory/InventoryUseContext";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { eatDish } from "#src/services/cooking/eatDish";
import { checkIsFragileResin } from "#src/services/inventory/checkIsFragileResin";
import { getInventoryItemLearning } from "#src/services/inventory/getInventoryItemLearning";
import { refillOriginalResinWithFragileResin } from "#src/services/originalResin/refillOriginalResinWithFragileResin";
import { ItemCategory } from "genshin-interface";

// The bag, wallet and progress after one of its entries is used, routed by the entry's kind: a food is eaten, up to `count`
// Of it, through its dish's use by the Character on the field, Fragile Resin is routed by its id, since The published material
// Table does not yet carry the item, and an item that teaches a dish, recipe or blueprint is used by learning it. Undefined,
// With nothing changed, where the bag holds no such entry or its kind has no use yet
export const useInventoryEntry = (
  inventory: Inventory,
  entryId: number,
  context: InventoryUseContext & {
    count?: number;
    eaterId: number;
    getMaxHealth: (characterId: number) => number;
    kitEffectState: KitEffectState;
    now: Temporal.Instant;
    party: Party;
    wallet: Wallet;
  },
): InventoryEntryUse | undefined => {
  const { count = 1, dishUseMap, eaterId, getMaxHealth, kitEffectState, now, party, wallet } = context;
  const item = inventory.items.find(({ id }) => id === entryId);
  if (item === undefined) return undefined;
  if (checkIsFragileResin(item)) return refillOriginalResinWithFragileResin(inventory, wallet, now);
  const learning = getInventoryItemLearning(item, context);
  if (learning !== undefined) return learning.learn(inventory);
  switch (item.definition.category) {
    case ItemCategory.Food: {
      const dishUse = dishUseMap.get(item.definition.id);
      if (dishUse === undefined) return undefined;
      const eatenInventory = eatDish(inventory, item.definition.id, dishUse, {
        count,
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
