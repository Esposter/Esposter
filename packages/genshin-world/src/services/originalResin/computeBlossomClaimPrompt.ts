import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { BlossomClaimPrompt } from "#src/models/originalResin/BlossomClaimPrompt";
import type { BlossomKind } from "#src/models/originalResin/BlossomKind";

import { Currency } from "#src/models/inventory/Currency";
import { CONDENSED_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { computeAffordableBlossomClaimOffers } from "#src/services/originalResin/computeAffordableBlossomClaimOffers";
import { FRAGILE_RESIN_ITEM_ID } from "#src/services/originalResin/constants";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";

// The claims F offers at a revealed blossom, paid from what is held at `now`: the offers the Original and Condensed Resin
// Afford. Where the Original Resin covers no resin claim and a Fragile Resin is held, the prompt offers its restore, after
// Which the claims are offered again from the restored holdings
export const computeBlossomClaimPrompt = (
  kind: BlossomKind,
  weeklyBossClaimsMade: number,
  wallet: Wallet,
  inventory: Inventory,
  now: Temporal.Instant,
): BlossomClaimPrompt => {
  const originalResin = regenerateOriginalResin(wallet, now)[Currency.OriginalResin];
  const offers = computeAffordableBlossomClaimOffers(
    kind,
    weeklyBossClaimsMade,
    originalResin,
    countInventoryItem(inventory.items, CONDENSED_RESIN_ITEM_ID),
  );
  return {
    canRestore:
      countInventoryItem(inventory.items, FRAGILE_RESIN_ITEM_ID) > 0 &&
      offers.every(({ condensedResinCount }) => condensedResinCount > 0),
    offers,
  };
};
