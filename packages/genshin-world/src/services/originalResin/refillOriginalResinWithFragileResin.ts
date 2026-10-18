import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { FragileResinUse } from "#src/models/originalResin/FragileResinUse";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { FRAGILE_RESIN_ITEM_ID, FRAGILE_RESIN_RESTORE } from "#src/services/originalResin/constants";
import { refillOriginalResin } from "#src/services/originalResin/refillOriginalResin";

// The bag and the wallet after one Fragile Resin is used from the bag at `now`: the Original Resin it restores is
// Added as a refill adds it, and one leaves the bag. Undefined where the bag holds none, and nothing changes
export const refillOriginalResinWithFragileResin = (
  inventory: Inventory,
  wallet: Wallet,
  now: Temporal.Instant,
): FragileResinUse | undefined => {
  if (countInventoryItem(inventory.items, FRAGILE_RESIN_ITEM_ID) < 1) return undefined;
  return {
    inventory: { ...inventory, items: takeInventoryItems(inventory.items, FRAGILE_RESIN_ITEM_ID, 1) },
    wallet: refillOriginalResin(wallet, FRAGILE_RESIN_RESTORE, now),
  };
};
