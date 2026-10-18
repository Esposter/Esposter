import type { Fish } from "#src/models/fishing/Fish";
import type { FishReward } from "#src/models/fishing/FishReward";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryAddition } from "#src/models/inventory/InventoryAddition";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The bag after a catch: the fish's reward row gives its items, each taken in as a pick up takes it, and their overflow
// Is summed. A fish's own item is in the bag only where its row names it, as the two fish sharing a row give the row's
// Item instead. Each item is resolved by its id through the names and the materials' table
export const addFishingCatch = (
  inventory: Inventory,
  { rewardId }: Pick<Fish, "rewardId">,
  rewards: ReadonlyMap<number, FishReward>,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): InventoryAddition => {
  const reward = rewards.get(rewardId);
  if (!reward) throw new InvalidOperationError(Operation.Read, String(rewardId), "has no row in the rewards' table");
  return reward.rewardItemList.reduce<InventoryAddition>(
    (addition, { itemCount, itemId }) => {
      const definition = getItemDefinition(itemId, names, materialDataMap);
      const taken = addInventoryItem(addition.inventory, definition, itemCount);
      return { inventory: taken.inventory, overflow: addition.overflow + taken.overflow };
    },
    { inventory, overflow: 0 },
  );
};
