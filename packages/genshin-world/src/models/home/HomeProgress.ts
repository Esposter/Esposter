import type { HomeOrder } from "#src/models/home/HomeOrder";

// The realm a player has: the Trust EXP gained, the blueprints learned from their diagrams and the furnishings made, the
// Furnishings each queue is making, the characters living in the realm, and the Realm Currency and Realm Bounty
// Stored as they stood at `accruedAt`
export interface HomeProgress {
  accruedAt: Temporal.Instant;
  companionIds: number[];
  learnedBlueprintIds: number[];
  madeBlueprintIds: number[];
  orders: HomeOrder[];
  realmBounty: number;
  realmCurrency: number;
  trustExp: number;
}
