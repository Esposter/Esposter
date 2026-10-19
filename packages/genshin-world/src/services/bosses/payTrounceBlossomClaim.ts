import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ResinClaim } from "#src/models/originalResin/ResinClaim";

import { spendOriginalResin } from "#src/services/originalResin/spendOriginalResin";
import { grantRewardItems } from "#src/services/reward/grantRewardItems";

// Pays a Trounce Blossom's claim: `resin` of Original Resin spent at `now`, then the rewards taken into the bag and the
// Wallet. The boss's Adventure EXP is granted through the rank by the caller, so the resin gains none here, and no Mora
// Is paid twice past rank 60. Undefined where the resin is not held or the bag cannot take an item whole
export const payTrounceBlossomClaim = (
  wallet: Wallet,
  inventory: Inventory,
  resin: number,
  rewards: ItemCount[],
  now: Temporal.Instant,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): Pick<ResinClaim, "inventory" | "wallet"> | undefined => {
  const spentWallet = spendOriginalResin(wallet, resin, now);
  if (!spentWallet) return undefined;
  return grantRewardItems(spentWallet, inventory, rewards, names, materialDataMap);
};
