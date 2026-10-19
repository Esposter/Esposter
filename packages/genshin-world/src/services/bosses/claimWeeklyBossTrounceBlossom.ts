import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { ResinClaim } from "#src/models/originalResin/ResinClaim";

import { drawWeeklyBossReward } from "#src/services/bosses/drawWeeklyBossReward";
import { payTrounceBlossomClaim } from "#src/services/bosses/payTrounceBlossomClaim";

// A claim at a weekly boss's Trounce Blossom, paid by the offer the player chose: its price in Original Resin, and the
// Reward its World Level draws. A weekly boss's offer is one claim, so the reward is drawn once. The Adventure and
// Companionship EXP are paid by the caller, as a normal boss's claim pays them. A claim the resin or the bag cannot pay
// Whole is refused
export const claimWeeklyBossTrounceBlossom = (
  wallet: Wallet,
  inventory: Inventory,
  offer: BlossomClaimOffer,
  worldLevel: number,
  now: Temporal.Instant,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  random: () => number,
): Pick<ResinClaim, "inventory" | "wallet"> | undefined =>
  payTrounceBlossomClaim(
    wallet,
    inventory,
    offer.resin,
    drawWeeklyBossReward(worldLevel, random),
    now,
    names,
    materialDataMap,
  );
