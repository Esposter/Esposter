import type { DishUse } from "#src/models/cooking/DishUse";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { eatDish } from "#src/services/cooking/eatDish";
import { ItemCategory } from "genshin-interface";

// The bag after one of its entries is used, routed by the entry's kind: a food is eaten through its dish's use by the
// Character on the field. Undefined, with nothing changed, where the bag holds no such entry or its kind has no use yet
export const useInventoryEntry = (
  inventory: Inventory,
  entryId: number,
  {
    dishUseMap,
    eaterId,
    getMaxHealth,
    kitEffectState,
    party,
  }: {
    dishUseMap: ReadonlyMap<number, DishUse>;
    eaterId: number;
    getMaxHealth: (characterId: number) => number;
    kitEffectState: KitEffectState;
    party: Party;
  },
): Inventory | undefined => {
  const item = inventory.items.find(({ id }) => id === entryId);
  if (item === undefined) return undefined;
  switch (item.definition.category) {
    case ItemCategory.Food: {
      const dishUse = dishUseMap.get(item.definition.id);
      return dishUse === undefined
        ? undefined
        : eatDish(inventory, item.definition.id, dishUse, { eaterId, getMaxHealth, kitEffectState, party });
    }
    default:
      return undefined;
  }
};
