import type { RewardItem } from "#src/models/reward/RewardItem";

import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { rewardItemSchema } from "#src/models/reward/RewardItem";
import { z } from "zod";

// When one kind of a region's outcrop opens: at an Adventure Rank, and once each of the listed nations has an area
// Unlocked, which the game takes as its Statue of The Seven activated. Its claim gives each World Level's row of
// Rewards, the row for World Level 0 first and the last row for every World Level past the list
export interface OutcropKindRule {
  kind: OutcropKind;
  playerLevel: number;
  unlockCityIds: number[];
  worldLevelRewards: RewardItem[][];
}

export const outcropKindRuleSchema = z.object({
  kind: z.enum(OutcropKind),
  playerLevel: z.int().min(1),
  unlockCityIds: z.array(z.int().min(1)),
  worldLevelRewards: z.array(z.array(rewardItemSchema)).min(1),
}) satisfies z.ZodType<OutcropKindRule>;
