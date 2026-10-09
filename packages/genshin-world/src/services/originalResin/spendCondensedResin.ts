import type { Inventory } from "#src/models/inventory/Inventory";
import type { BlossomKind } from "#src/models/originalResin/BlossomKind";

import { CONDENSED_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { checkIsMultiClaimBlossom } from "#src/services/originalResin/checkIsMultiClaimBlossom";

// The bag with one Condensed Resin taken out for a claim of three rewards at `kind`, or undefined where the claim is not
// A ley line's or a domain's, or the bag holds none. The claim spends no Original Resin, so it gives no Adventure EXP
export const spendCondensedResin = (inventory: Inventory, kind: BlossomKind): Inventory | undefined => {
  const condensedResinCount = countInventoryItem(inventory.items, CONDENSED_RESIN_ITEM_ID);
  if (!checkIsMultiClaimBlossom(kind) || condensedResinCount < 1) return undefined;
  return { ...inventory, items: takeInventoryItems(inventory.items, CONDENSED_RESIN_ITEM_ID, 1) };
};
