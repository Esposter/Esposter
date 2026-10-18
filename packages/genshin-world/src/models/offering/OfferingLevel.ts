import type { OfferingReward } from "#src/models/offering/OfferingReward";

import { z } from "zod";

// One item an offering level takes off the held counts: the item, and how many of it the level takes
export interface OfferingLevelItem {
  itemCount: number;
  itemId: number;
}

export const offeringLevelItemSchema = z.object({
  itemCount: z.int().positive(),
  itemId: z.int().positive(),
}) satisfies z.ZodType<OfferingLevelItem>;

// One level of an offering, from the game's level-up table: the items it takes off the held counts, each kind counted
// Apart, and the rewards it pays. A level naming no item takes none, and level 1 is paid when the offering starts
export interface OfferingLevel {
  items: OfferingLevelItem[];
  level: number;
  rewards: OfferingReward[];
}
