import type { HomeOrder } from "#src/models/home/HomeOrder";

// The realm a player has: the Trust EXP gained, the blueprints learned from their diagrams and the furnishings made, the
// Furnishings each queue is making, the characters living in the realm, and the companions' one-time rewards already
// Given. Each of the Realm Currency and Realm Bounty is stored as it stood at its own accrual instant
export interface HomeProgress {
  claimedRewardIds: number[];
  companionIds: number[];
  learnedBlueprintIds: number[];
  madeBlueprintIds: number[];
  orders: HomeOrder[];
  realmBounty: number;
  realmBountyAccruedAt: Temporal.Instant;
  realmCurrency: number;
  realmCurrencyAccruedAt: Temporal.Instant;
  trustExp: number;
}
