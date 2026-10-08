import type { StatueReward } from "#src/models/statue/StatueReward";

import { statueRewardSchema } from "#src/models/statue/StatueReward";
import { z } from "zod";

// One level of a region's Statues of The Seven, from the game's level-up table: the Oculi it takes off the held count,
// The items it pays, and the stamina it adds to the maximum. Level 1 takes no Oculi and is paid when the region starts
export interface StatueLevel {
  level: number;
  oculusCount: number;
  oculusItemId: number;
  rewards: StatueReward[];
  staminaShare: number;
}

export const statueLevelSchema = z.object({
  level: z.int().positive(),
  oculusCount: z.int().nonnegative(),
  oculusItemId: z.int().nonnegative(),
  rewards: z.array(statueRewardSchema),
  staminaShare: z.int().nonnegative(),
}) satisfies z.ZodType<StatueLevel>;
