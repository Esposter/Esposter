import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { BlossomClaim } from "#src/models/originalResin/BlossomClaim";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { BlossomKind } from "#src/models/originalResin/BlossomKind";

import { Currency } from "#src/models/inventory/Currency";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { claimOriginalResin } from "#src/services/originalResin/claimOriginalResin";
import { COMPANIONSHIP_EXP_ITEM_ID } from "#src/services/originalResin/constants";
import { spendCondensedResin } from "#src/services/originalResin/spendCondensedResin";

// The state after a blossom's claim at `offer`, paid in Original Resin or a Condensed Resin, and each of its
// `claimCount` draws of the challenge's reward taken in: the Mora into the wallet, the rest into the bag, the Adventure
// EXP and the Companionship EXP left out. Undefined where the offer is not paid or the bag cannot take every item whole,
// Which keeps the resin or the Condensed Resin in hand
export const claimBlossom = (
  adventureRankTables: AdventureRankTables,
  wallet: Wallet,
  inventory: Inventory,
  offer: BlossomClaimOffer,
  kind: BlossomKind,
  adventureExp: number,
  completedMainQuestIds: ReadonlySet<string>,
  now: Temporal.Instant,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  drawReward: () => ItemCount[],
): BlossomClaim | undefined => {
  let paid: BlossomClaim | undefined;
  if (offer.condensedResinCount > 0) {
    const spentInventory = spendCondensedResin(inventory, kind);
    if (spentInventory) paid = { adventureExp, inventory: spentInventory, wallet };
  } else {
    const claimedResin = claimOriginalResin(
      adventureRankTables,
      wallet,
      offer.resin,
      adventureExp,
      completedMainQuestIds,
      now,
    );
    if (claimedResin) paid = { adventureExp: claimedResin.adventureExp, inventory, wallet: claimedResin.wallet };
  }
  if (!paid) return undefined;
  let claimedInventory = paid.inventory;
  let moraCount = 0;
  for (const { count, id } of Array.from({ length: offer.claimCount }, drawReward).flat())
    if (id === MORA_ITEM_ID) moraCount += count;
    else if (id !== ADVENTURE_EXP_ITEM_ID && id !== COMPANIONSHIP_EXP_ITEM_ID) {
      const addition = addInventoryItem(claimedInventory, getItemDefinition(id, names, materialDataMap), count);
      if (addition.overflow > 0) return undefined;
      claimedInventory = addition.inventory;
    }
  return {
    adventureExp: paid.adventureExp,
    inventory: claimedInventory,
    wallet: { ...paid.wallet, [Currency.Mora]: paid.wallet[Currency.Mora] + moraCount },
  };
};
